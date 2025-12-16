require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); // 1. IMPORT JWT
const cookieParser = require('cookie-parser'); // 2. IMPORT COOKIE PARSER
const paymentController = require('./controllers/paymentController');
const app = express();
const PORT = 5000;

// --- CẤU HÌNH BẢO MẬT & CORS ---
// Quan trọng: Phải chỉ định rõ origin frontend để gửi được Cookie
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true 
}));

app.use(express.json());
app.use(cookieParser()); // 3. KÍCH HOẠT COOKIE PARSER

// --- CONFIG MAIL & CLOUDINARY ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
const generateVoucherCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};
const sendEmail = async (to, subject, htmlContent) => {
    try {
        await transporter.sendMail({
            from: '"Tâm An Tea Shop" <no-reply@taman.com>',
            to: to,
            subject: subject,
            html: htmlContent
        });
    } catch (error) {
        console.error("❌ Lỗi gửi mail:", error);
    }
};

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});
const upload = multer({ dest: 'uploads/' });

// --- CONFIG SQL ---
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME,
    options: { encrypt: false, trustServerCertificate: true }
};

async function connectDB() {
    try {
        await sql.connect(dbConfig);
        console.log("✅ Đã kết nối SQL Server thành công!");
    } catch (err) {
        console.error("❌ Lỗi kết nối SQL:", err);
    }
}
connectDB();

const ACCESS_KEY = process.env.ACCESS_KEY ;
const REFRESH_KEY = process.env.REFRESH_KEY ;
if (!ACCESS_KEY || !REFRESH_KEY) {
    console.error("CHƯA CẤU HÌNH JWT KEY TRONG FILE .ENV");
    process.exit(1);
}

// Hàm tạo Token
const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, ACCESS_KEY, { expiresIn: '15m' }); // 15 phút
};
const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id }, REFRESH_KEY, { expiresIn: '7d' }); // 7 ngày
};

// Middleware: Kiểm tra đăng nhập
const verifyToken = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ success: false, message: "Chưa đăng nhập!" });

    jwt.verify(token, ACCESS_KEY, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: "Token không hợp lệ!" });
        req.user = user;
        next();
    });
};

// Middleware: Chỉ cho phép Admin
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ success: false, message: "Bạn không có quyền Admin!" });
        }
    });
};

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await sql.query`SELECT * FROM Users WHERE email = ${email} AND password = ${password}`;
        const user = result.recordset[0];

        if (user) {
            // Tạo tokens
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            // Cập nhật RefreshToken vào DB (Cơ chế Single Session - Đăng nhập nơi khác sẽ bị out)
            await sql.query`UPDATE Users SET refreshToken = ${refreshToken} WHERE id = ${user.id}`;

            // Lưu vào Cookie (HttpOnly -> JS không đọc được, chống XSS)
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: false, // Để true nếu chạy HTTPS
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000 // 15 phút
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
            });

            res.json({
                success: true,
                message: "Đăng nhập thành công!",
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        } else {
            res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu!" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Không có Refresh Token" });

    jwt.verify(refreshToken, REFRESH_KEY, async (err, userDecoded) => {
        if (err) return res.status(403).json({ message: "Token không hợp lệ" });

        // Kiểm tra token trong DB có khớp không (Check Single Session)
        const dbCheck = await sql.query`SELECT * FROM Users WHERE id = ${userDecoded.id} AND refreshToken = ${refreshToken}`;
        
        if (dbCheck.recordset.length === 0) {
            return res.status(403).json({ message: "Phiên đăng nhập đã hết hạn hoặc tài khoản đang dùng ở nơi khác!" });
        }

        const user = dbCheck.recordset[0];
        
        // Tạo bộ token mới (Xoay vòng token)
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Cập nhật DB
        await sql.query`UPDATE Users SET refreshToken = ${newRefreshToken} WHERE id = ${user.id}`;

        // Gửi lại Cookie
        res.cookie('accessToken', newAccessToken, { httpOnly: true, sameSite: 'strict', maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.json({ success: true, message: "Token đã được làm mới" });
    });
});


app.post('/api/logout', verifyToken, async (req, res) => {
    try {
        await sql.query`UPDATE Users SET refreshToken = NULL WHERE id = ${req.user.id}`;
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ success: true, message: "Đăng xuất thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const check = await sql.query`SELECT * FROM Users WHERE email = ${email}`;
        if (check.recordset.length > 0) return res.status(400).json({ success: false, message: "Email này đã tồn tại!" });

        await sql.query`INSERT INTO Users (name, email, password, role) VALUES (${name}, ${email}, ${password}, 'user')`;
        
        const mailContent = `<h1>Chào mừng ${name} đến với Tâm An Tea! 🌿</h1><p>Cảm ơn bạn đã đăng ký tài khoản.</p>`;
        sendEmail(email, "Chào mừng thành viên mới", mailContent);

        const newUser = await sql.query`SELECT TOP 1 * FROM Users ORDER BY id DESC`;
        res.json({ success: true, message: "Đăng ký thành công!", user: newUser.recordset[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/update', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id; 
        const { name, password, email, address, phone } = req.body;

        const request = new sql.Request();
        request.input('id', userId);
        request.input('name', name);
        request.input('password', password);
        request.input('email', email);
        request.input('address', address); 
        request.input('phone', phone);     
        
        await request.query(`UPDATE Users SET name=@name, password=@password, email=@email, address=@address, phone=@phone WHERE id=@id`);
        
        const result = await request.query('SELECT * FROM Users WHERE id = @id');
        res.json({ success: true, message: "Cập nhật thành công!", user: result.recordset[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/categories', async (req, res) => {
    try {
        // DISTINCT giúp lấy ra các giá trị không trùng lặp
        const result = await sql.query('SELECT DISTINCT category FROM Products');
        // Trả về mảng object [{ category: "Trà Xanh" }, { category: "Trà Thảo Mộc" }]
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/products', async (req, res) => {
    try {
        const { search, category } = req.query; // Thêm tham số category
        
        let query = 'SELECT * FROM Products WHERE 1=1'; // Mẹo WHERE 1=1 để dễ nối chuỗi
        const request = new sql.Request();

        if (search) {
            query += ` AND name LIKE N'%${search}%'`; 
        }

        if (category) {
            query += ` AND category = @category`;
            request.input('category', category); // Dùng tham số để bảo mật
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/products', async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM Products';
        if (search) query += ` WHERE name LIKE N'%${search}%'`; 
        const result = await sql.query(query);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await sql.query`SELECT * FROM Products WHERE id = ${id}`;
        if (result.recordset.length > 0) res.json(result.recordset[0]);
        else res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, price, desc, category, stock } = req.body;
        let imgUrl = "https://via.placeholder.com/300";

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imgUrl = result.secure_url;
            fs.unlinkSync(req.file.path);
        }

        const request = new sql.Request();
        await request.query`INSERT INTO Products (name, price, [desc], img, category, stock) VALUES (${name}, ${price}, ${desc}, ${imgUrl}, ${category}, ${stock})`;
        res.status(201).json({ success: true, message: "Thêm thành công!", img: imgUrl });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await sql.query`DELETE FROM Products WHERE id = ${id}`;
        res.json({ success: true, message: "Đã xóa" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/products/:id', verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, desc, category, stock } = req.body;
        
        const request = new sql.Request();
        request.input('id', id);
        request.input('name', name);
        request.input('price', price);
        request.input('desc', desc);
        request.input('category', category);
        request.input('stock', stock);

        let query = `UPDATE Products SET name = @name, price = @price, [desc] = @desc, category = @category, stock = @stock`;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            const imgUrl = result.secure_url;
            fs.unlinkSync(req.file.path);
            query += `, img = @img`;
            request.input('img', imgUrl);
        }
        query += ` WHERE id = @id`;
        await request.query(query);
        res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/cart/:userId', verifyToken, async (req, res) => {
    try {
        if (req.user.id != req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Không có quyền xem giỏ hàng này" });
        }

        const { userId } = req.params;
        const query = `
            SELECT c.id as cart_id, c.user_id, c.quantity, 
                   p.id as product_id, p.name, p.price, p.img, p.stock
            FROM Cart c
            JOIN Products p ON c.product_id = p.id
            WHERE c.user_id = @userId
        `;
        const request = new sql.Request();
        request.input('userId', userId);
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/cart/add', verifyToken, async (req, res) => {
    try {
        const { user_id, product_id, quantity } = req.body;
        // Bảo mật: check user_id
        if (req.user.id != user_id) return res.status(403).json({ message: "Forbidden" });

        const request = new sql.Request();
        request.input('user_id', user_id);
        request.input('product_id', product_id);
        request.input('quantity', quantity);

        const check = await request.query(`SELECT * FROM Cart WHERE user_id = @user_id AND product_id = @product_id`);
        if (check.recordset.length > 0) {
            await request.query(`UPDATE Cart SET quantity = quantity + @quantity WHERE user_id = @user_id AND product_id = @product_id`);
        } else {
            await request.query(`INSERT INTO Cart (user_id, product_id, quantity) VALUES (@user_id, @product_id, @quantity)`);
        }
        res.json({ success: true, message: "Đã cập nhật giỏ hàng!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/cart/update', verifyToken, async (req, res) => {
    try {
        const { user_id, product_id, quantity } = req.body;
        if (req.user.id != user_id) return res.status(403).json({ message: "Forbidden" });

        const request = new sql.Request();
        request.input('user_id', user_id);
        request.input('product_id', product_id);

        if (quantity <= 0) {
             await request.query(`DELETE FROM Cart WHERE user_id = @user_id AND product_id = @product_id`);
             return res.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ" });
        }
        request.input('quantity', quantity);
        await request.query(`UPDATE Cart SET quantity = @quantity WHERE user_id = @user_id AND product_id = @product_id`);
        res.json({ success: true, message: "Cập nhật số lượng thành công!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/cart/remove/:userId/:productId', verifyToken, async (req, res) => {
    try {
        const { userId, productId } = req.params;
        if (req.user.id != userId) return res.status(403).json({ message: "Forbidden" });

        const request = new sql.Request();
        request.input('userId', userId);
        request.input('productId', productId);
        await request.query(`DELETE FROM Cart WHERE user_id = @userId AND product_id = @productId`);
        res.json({ success: true, message: "Đã xóa sản phẩm" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/cart/clear/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user.id != userId) return res.status(403).json({ message: "Forbidden" });

        const request = new sql.Request();
        request.input('userId', userId);
        await request.query(`DELETE FROM Cart WHERE user_id = @userId`);
        res.json({ success: true, message: "Đã làm trống giỏ hàng" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/orders', verifyAdmin, async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Orders ORDER BY order_date DESC`;
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { user_id, customer_name, phone, address, note, total_price, items, voucher_code, payment_method, payment_status } = req.body;

        const request = new sql.Request();
        request.input('user_id', user_id || null);
        request.input('customer_name', customer_name);
        request.input('phone', phone);
        request.input('address', address);
        request.input('note', note);
        request.input('total_price', total_price);
        request.input('items_json', JSON.stringify(items));
        
        // 1. Nhận dữ liệu từ Frontend
        request.input('payment_method', payment_method || 'COD'); 
        request.input('payment_status', payment_status || 'UNPAID');

        // Debug: In ra xem Frontend gửi gì lên (Xem tại Terminal)
        console.log("DEBUG ORDER:", { payment_method, payment_status });

        // 2. CÂU LỆNH INSERT PHẢI CÓ CỘT payment_status (QUAN TRỌNG NHẤT)
        await request.query(`
            INSERT INTO Orders (
                user_id, customer_name, phone, address, note, total_price, items_json, 
                payment_method, payment_status 
            )
            VALUES (
                @user_id, @customer_name, @phone, @address, @note, @total_price, @items_json, 
                @payment_method, @payment_status
            )
        `);

        // ... (Phần xử lý voucher và xóa giỏ hàng giữ nguyên) ...
        if (voucher_code) {
             const vReq = new sql.Request();
             vReq.input('code', voucher_code);
             await vReq.query`UPDATE UserVouchers SET is_used = 1 WHERE code = @code`;
        }
        if (user_id) {
             const cartReq = new sql.Request();
             cartReq.input('user_id', user_id);
             await cartReq.query`DELETE FROM Cart WHERE user_id = @user_id`;
        }

        res.status(201).json({ success: true, message: "Đặt hàng thành công!" });
    } catch (err) {
        console.error("Lỗi đặt hàng:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/promotions', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Promotions ORDER BY percentage DESC');
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/promotions/spin', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userCheck = await sql.query`SELECT last_spin_date FROM Users WHERE id = ${userId}`;
        const lastSpin = userCheck.recordset[0]?.last_spin_date;

        if (lastSpin) {
            const now = new Date();
            const lastDate = new Date(lastSpin);
            const diffTime = Math.abs(now - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            if (diffDays < 7) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Bạn đã quay rồi! Vui lòng quay lại sau ${7 - diffDays} ngày nữa.` 
                });
            }
        }
        const prizesRes = await sql.query('SELECT * FROM Promotions');
        const prizes = prizesRes.recordset;

        if (prizes.length === 0) return res.status(400).json({ message: "Chưa có quà!" });
        const totalWeight = prizes.reduce((sum, item) => sum + (item.percentage || 0), 0);
        let randomNum = Math.random() * totalWeight;
        let winPrize = null;
        for (const prize of prizes) {
            if (randomNum < prize.percentage) {
                winPrize = prize;
                break;
            }
            randomNum -= prize.percentage;
        }
        if (!winPrize) winPrize = prizes[0];

        let voucherCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        await sql.query`UPDATE Users SET last_spin_date = GETDATE() WHERE id = ${userId}`;

        const request = new sql.Request();
        request.input('user_id', userId);
        request.input('code', voucherCode);
        request.input('value', winPrize.value);
        
        await request.query`
            INSERT INTO UserVouchers (user_id, code, discount_value, is_used)
            VALUES (@user_id, @code, @value, 0)
        `;

        res.json({ 
            success: true, 
            prize: winPrize, 
            code: voucherCode 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/voucher/apply', verifyToken, async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        const request = new sql.Request();
        request.input('code', code);
        request.input('userId', userId);

        const result = await request.query`
            SELECT * FROM UserVouchers 
            WHERE code = @code AND is_used = 0
        `;

        if (result.recordset.length > 0) {
            const voucher = result.recordset[0];
            
            if (voucher.user_id !== userId) {
                 return res.status(400).json({ success: false, message: "Mã này không thuộc về bạn!" });
            }

            res.json({ 
                success: true, 
                message: "Áp dụng mã thành công!", 
                discount: voucher.discount_value 
            });
        } else {
            res.status(400).json({ success: false, message: "Mã không hợp lệ hoặc đã được sử dụng!" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/promotions', verifyAdmin, async (req, res) => {
    try {
        const { label, value, color, percentage } = req.body;
        const request = new sql.Request();
        await request.query`INSERT INTO Promotions (label, value, color, percentage) VALUES (${label}, ${value}, ${color}, ${percentage})`;
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/promotions/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await sql.query`DELETE FROM Promotions WHERE id = ${id}`;
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { user_id, customer_name, phone, address, note, total_price, items, voucher_code } = req.body;

        const request = new sql.Request();
        request.input('user_id', user_id || null);
        request.input('customer_name', customer_name);
        request.input('phone', phone);
        request.input('address', address);
        request.input('note', note);
        request.input('total_price', total_price);
        request.input('items_json', JSON.stringify(items));

        await request.query(`
            INSERT INTO Orders (user_id, customer_name, phone, address, note, total_price, items_json)
            VALUES (@user_id, @customer_name, @phone, @address, @note, @total_price, @items_json)
        `);

        if (voucher_code) {
             const vReq = new sql.Request();
             vReq.input('code', voucher_code);
             await vReq.query`UPDATE UserVouchers SET is_used = 1 WHERE code = @code`;
        }

        res.status(201).json({ success: true, message: "Đặt hàng thành công!" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/create_payment_url', paymentController.createPaymentUrl);

app.get('/api/history', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const request = new sql.Request();
        request.input('userId', userId);
        const result = await request.query(`SELECT * FROM Orders WHERE user_id = @userId ORDER BY order_date DESC`);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/orderdone', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.body; // Lấy ID đơn hàng từ URL

        const request = new sql.Request();
        request.input('id', id);
        await request.query`
            UPDATE Orders 
            SET payment_status = 'PAID' 
            WHERE id = @id
        `;

        res.json({ success: true, message: "Đã cập nhật trạng thái đơn hàng thành công!" });
    } catch (err) {
        console.error("Lỗi cập nhật đơn hàng:", err);
        res.status(500).json({ error: err.message });
    }
});
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});