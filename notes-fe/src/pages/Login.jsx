import { useState, useEffect } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { requestLogin, verifyLoginToken, loginGoogle } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";


function Login() {
    const [isLoading, setIsLoading] = useState({ telegram: false, google: false });
    const [loginToken, setLoginToken] = useState(null);
    const [telegramUrl, setTelegramUrl] = useState(null);
    const [isPolling, setIsPolling] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const navigate = useNavigate();
    const { setUser } = useAuth();

    useEffect(() => {
        if (!isPolling || !loginToken) return;

        const interval = setInterval(async () => {
            try {
                const response = await verifyLoginToken(loginToken);

                if (response.user) {
                    setUser(response.user);
                    toast.success("Login dengan Telegram berhasil!");
                    setIsPolling(false);
                    navigate("/notes/new");
                }
            } catch (error) {
                if (error.response?.status === 401) {
                    setIsPolling(false);
                    setLoginToken(null);
                    setTelegramUrl(null);
                    setIsLoading({ telegram: false, google: false });
                    toast.error("Token expired. Silakan coba lagi.");
                }
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [isPolling, loginToken, navigate, setUser]);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsPolling(false);
                    setLoginToken(null);
                    setTelegramUrl(null);
                    setIsLoading({ telegram: false, google: false });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleTelegramLogin = async () => {
        try {
            setIsLoading({ ...isLoading, telegram: true });

            const response = await requestLogin();

            setLoginToken(response.loginToken);
            setTelegramUrl(response.telegramUrl);
            setTimeLeft(response.expiresIn);
            setIsPolling(true);

            window.open(response.telegramUrl, "_blank");

        } catch (error) {
            console.error("Telegram login error:", error);
            toast.error("Gagal login dengan Telegram");
            setIsLoading({ ...isLoading, telegram: false });
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setIsLoading({ ...isLoading, google: true });

            await new Promise(resolve => setTimeout(resolve, 1500));

            toast("Login dengan Google akan segera tersedia");
        } catch (error) {
            console.error("Google login error:", error);
            toast.error("Gagal login dengan Google");
        } finally {
            setIsLoading({ ...isLoading, google: false });
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCancel = () => {
        setLoginToken(null);
        setTelegramUrl(null);
        setIsPolling(false);
        setTimeLeft(0);
        setIsLoading({ telegram: false, google: false });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary text-primary p-4">
            <div className="w-full max-w-md">
                <div className="bg-primary rounded-2xl p-8 shadow-lg border border-custom">
                    <h2 className="text-xl font-semibold mb-6 text-center">
                        Masuk ke Akun Anda
                    </h2>

                    <div className="space-y-5">
                        {!loginToken ? (
                            <>
                                <button
                                    onClick={handleTelegramLogin}
                                    disabled={isLoading.telegram || isLoading.google}
                                    className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {isLoading.telegram ? "Connecting..." : "Login with Telegram"}
                                </button>

                                <div className="relative flex items-center">
                                    <div className="grow border-t border-custom"></div>
                                    <span className="shrink mx-4 text-secondary text-sm">atau</span>
                                    <div className="grow border-t border-custom"></div>
                                </div>

                                <GoogleLogin
                                    onSuccess={async (credentialResponse) => {
                                        try {
                                            const idToken = credentialResponse.credential;
                                            const res = await loginGoogle(idToken);

                                            setUser(res.user || res.data?.user);

                                            toast.success("Login berhasil");
                                            navigate("/notes/new");
                                        } catch (err) {
                                            console.error(err);
                                            toast.error("Login gagal");
                                        }
                                    }}
                                    onError={() => toast.error("Login gagal")}
                                />
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-center mb-1 font-medium">
                                        ⏱️ Menunggu konfirmasi dari Telegram
                                    </p>
                                    <p className="text-xs text-center text-secondary mb-3">
                                        Silakan buka Telegram dan konfirmasi login Anda
                                    </p>
                                    <p className="text-xs text-center text-secondary font-mono">
                                        Expires in: {formatTime(timeLeft)}
                                    </p>
                                    <div className="flex justify-center mt-3">
                                        <Loader2 size={24} className="animate-spin text-blue-600" />
                                    </div>
                                </div>

                                <button
                                    onClick={() => window.open(telegramUrl, "_blank")}
                                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2"
                                >
                                    <ExternalLink size={18} />
                                    Buka Telegram
                                </button>

                                <button
                                    onClick={handleCancel}
                                    className="w-full px-6 py-3 border border-custom hover:bg-secondary rounded-xl transition-all font-medium"
                                >
                                    Batal
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;