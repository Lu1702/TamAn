import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Promotion = () => {
    const [isFinished, setIsFinished] = useState(false);
    const playerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // CHỈ CẦN KHỞI TẠO YOUTUBE, KHÔNG CẦN FETCH API NỮA
        const initPlayer = () => {
            if (window.YT && window.YT.Player && playerRef.current) {
                new window.YT.Player(playerRef.current, {
                    videoId: 'PVwvDtf59ek', // Link video cứng của bạn
                    playerVars: { 'rel': 0, 'modestbranding': 1 },
                    events: {
                        'onStateChange': (event) => {
                            if (event.data === window.YT.PlayerState.ENDED) {
                                setIsFinished(true);
                            }
                        }
                    }
                });
            }
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            window.onYouTubeIframeAPIReady = initPlayer;
        }
    }, []);

    return (
        <div className="relative min-h-screen py-12 px-4 flex flex-col items-center overflow-hidden font-['Times_New_Roman'] serif">
            {/* Background 30% opacity */}
            <div className="absolute inset-0 -z-10 bg-cover bg-center opacity-30 bg-no-repeat bg-[url('/images/background.jpg')]"></div>

            <div className="relative z-10 w-full flex flex-col items-center">
                <div className="w-full flex justify-center mb-8">
                    <div className="bg-white/40 backdrop-blur-md px-10 py-5 rounded-2xl shadow-lg border border-white/20">
                        <h1 className="text-4xl font-bold text-black text-center">
                            HÃY XEM HẾT VIDEO ĐỂ NHẬN ĐƯỢC ƯU ĐÃI!
                        </h1>
                    </div>
                </div>

                <div className="w-full flex justify-center items-center hover:opacity-100 transition-opacity duration-500 my-8">
                    <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-black">
                        <div ref={playerRef} className="absolute inset-0 w-full h-full"></div>
                    </div>
                </div>

                {isFinished && (
                    <div className="mt-8 p-8 bg-white/90 backdrop-blur-sm border-2 border-dashed border-green-700 rounded-xl max-w-xl text-center animate-bounce shadow-xl">
                        <h3 className="text-2xl font-bold text-green-800 uppercase">🎉 TAMAN2025</h3>
                        <button onClick={() => navigate('/shop')} className="bg-black text-white px-10 py-3 mt-4 rounded-md font-bold uppercase">
                            Dùng ngay
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Promotion;