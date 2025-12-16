require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 1. CONFIG MAIL & CLOUDINARY
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

// 2. CONFIG SQL
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER,
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

// --- API USER ---

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await sql.query`SELECT * FROM Users WHERE email = ${email} AND password = ${password}`;
        const user = result.recordset[0];

        if (user) {
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

app.post('/api/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        const check = await sql.query`SELECT * FROM Users WHERE email = ${email}`;
        if (check.recordset.length > 0) {
            return res.status(400).json({ success: false, message: "Email này đã tồn tại!" });
        }

        await sql.query`INSERT INTO Users (name, email, password, role) VALUES (${name}, ${email}, ${password}, 'user')`;
        
        // Gửi mail chào mừng
        const mailContent = `<h1>Chào mừng ${name} đến với Tâm An Tea! 🌿</h1><p>Cảm ơn bạn đã đăng ký tài khoản.</p>`;
        sendEmail(email, "Chào mừng thành viên mới", mailContent);

        const newUser = await sql.query`SELECT TOP 1 * FROM Users ORDER BY id DESC`;

        res.json({
            success: true,
            message: "Đăng ký thành công!",
            user: newUser.recordset[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/update', async (req, res) => {
    try {
        const { name, password, email, address, phone } = req.body;
        if (!email) return res.status(400).json({ message: "Thiếu Email" });

        const request = new sql.Request();
        request.input('name', name);
        request.input('password', password);
        request.input('email', email);
        request.input('address', address); 
        request.input('phone', phone);     
        
        await request.query(`UPDATE Users SET name=@name, password=@password, address=@address, phone=@phone WHERE email=@email`);

        const result = await request.query('SELECT * FROM Users WHERE email = @email');
        res.json({ success: true, message: "Cập nhật thành công!", user: result.recordset[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API PRODUCTS ---

app.get('/api/products', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Products');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await sql.query`SELECT * FROM Products WHERE id = ${id}`;
        if (result.recordset.length > 0) res.json(result.recordset[0]);
        else res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
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
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await sql.query`DELETE FROM Products WHERE id = ${id}`;
        res.json({ success: true, message: "Đã xóa" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/products/:id', upload.single('image'), async (req, res) => {
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
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API ORDERS (QUAN TRỌNG: ĐÃ XÓA CODE TRÙNG) ---

// 1. Lấy danh sách đơn hàng (Cho Admin)
app.get('/api/orders', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Orders ORDER BY order_date DESC`;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Tạo đơn hàng mới (Lưu vào DB)
app.post('/api/orders', async (req, res) => {
    try {
        const { user_id, customer_name, phone, address, note, total_price, items } = req.body;

        const request = new sql.Request();
        
        // Input cho SQL
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

        res.status(201).json({ success: true, message: "Đặt hàng thành công!" });

    } catch (err) {
        console.error("Lỗi đặt hàng:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});