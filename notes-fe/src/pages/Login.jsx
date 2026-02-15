import { useState } from "react";
import { MessageCircle, Chrome, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
    const [isLoading, setIsLoading] = useState({ telegram: false, google: false });
    const navigate = useNavigate();

    const handleTelegramLogin = async () => {
        try {
            setIsLoading({ ...isLoading, telegram: true });

            // TODO: Implementasi login dengan Telegram
            // Contoh: window.location.href = 'YOUR_TELEGRAM_AUTH_URL';

            // Simulasi delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success("Login dengan Telegram berhasil!");
            navigate("/notes/new");

        } catch (error) {
            console.error("Telegram login error:", error);
            toast.error("Gagal login dengan Telegram");
        } finally {
            setIsLoading({ ...isLoading, telegram: false });
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setIsLoading({ ...isLoading, google: true });

            // TODO: Implementasi login dengan Google
            // Contoh menggunakan Google OAuth
            // const provider = new GoogleAuthProvider();
            // await signInWithPopup(auth, provider);

            // Simulasi delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success("Login dengan Google berhasil!");
            navigate("/notes");

        } catch (error) {
            console.error("Google login error:", error);
            toast.error("Gagal login dengan Google");
        } finally {
            setIsLoading({ ...isLoading, google: false });
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary text-primary p-4">
            <div className="w-full max-w-md">
                <div className="bg-primary rounded-2xl p-8 shadow-lg border border-custom">
                    <h2 className="text-xl font-semibold mb-6 text-center">
                        Masuk ke Akun Anda
                    </h2>

                    <div className="space-y-5">

                        <div className="space-y-2">
                            <label className="text-sm text-secondary">
                                Telegram ID
                            </label>
                            <input
                                type="text"
                                placeholder="Masukkan Telegram ID Anda"
                                className="w-full px-4 py-3 rounded-xl border border-custom bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>

                        <p className="text-sm text-secondary">
                            Belum punya Telegram ID?{" "}
                            <span
                                className="text-blue-500 hover:underline cursor-pointer font-medium"
                                onClick={() => window.open("https://t.me/mind_garden_notes_bot?start=login", "_blank")
                                }
                            >
                                Get Telegram ID
                            </span>
                        </p>

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

                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoading.telegram || isLoading.google}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {isLoading.google ? (
                                <span>Connecting...</span>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 48 48">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.69 1.22 9.19 3.61l6.86-6.86C35.6 2.36 30.2 0 24 0 14.61 0 6.4 5.38 2.56 13.22l7.98 6.19C12.49 13.31 17.79 9.5 24 9.5z" />
                                        <path fill="#4285F4" d="M46.1 24.5c0-1.63-.15-3.2-.42-4.7H24v9h12.44c-.54 2.9-2.16 5.36-4.61 7.02l7.14 5.55C43.97 36.73 46.1 31.07 46.1 24.5z" />
                                        <path fill="#FBBC05" d="M10.54 28.41A14.5 14.5 0 019.5 24c0-1.54.27-3.03.76-4.41l-7.98-6.19A23.94 23.94 0 000 24c0 3.83.92 7.45 2.56 10.6l7.98-6.19z" />
                                        <path fill="#34A853" d="M24 48c6.2 0 11.4-2.05 15.2-5.59l-7.14-5.55c-2 1.34-4.56 2.14-8.06 2.14-6.21 0-11.51-3.81-13.46-9.22l-7.98 6.19C6.4 42.62 14.61 48 24 48z" />
                                    </svg>
                                    <span>Login with Google</span>
                                </>
                            )}
                        </button>


                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;