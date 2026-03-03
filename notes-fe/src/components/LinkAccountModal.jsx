import { useState, useEffect } from "react";
import { X, ExternalLink, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { linkGoogle, requestLinkTelegram, verifyLinkToken } from "../api/auth";

function LinkAccountModal({ provider, onClose, onSuccess }) {
    const [step, setStep] = useState("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [telegramUrl, setTelegramUrl] = useState("");
    const [linkToken, setLinkToken] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setStep("error");
                    setErrorMsg("Link kedaluwarsa. Silakan coba lagi.");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    useEffect(() => {
        if (step !== "waiting" || !linkToken) return;

        const interval = setInterval(async () => {
            try {
                const res = await verifyLinkToken(linkToken);
                if (res.status === "success") {
                    setStep("success");
                    onSuccess(res.user);
                }
            } catch (err) {
                const status = err.response?.status;
                const msg = err.response?.data?.error;
                if (status === 401) {
                    setStep("error");
                    setErrorMsg("Link kedaluwarsa. Silakan coba lagi.");
                } else if (status === 409 || status === 400) {
                    setStep("error");
                    setErrorMsg(msg || "Gagal menautkan akun.");
                }
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [step, linkToken, onSuccess]);

    const handleRequestTelegram = async () => {
        setStep("loading");
        setErrorMsg("");
        try {
            const res = await requestLinkTelegram();
            setLinkToken(res.linkToken);
            setTelegramUrl(res.telegramUrl);
            setTimeLeft(res.expiresIn);
            setStep("waiting");
            window.open(res.telegramUrl, "_blank");
        } catch (err) {
            setStep("error");
            setErrorMsg(err.response?.data?.error || "Gagal membuat link. Coba lagi.");
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setStep("loading");
        setErrorMsg("");
        try {
            const res = await linkGoogle(credentialResponse.credential);
            setStep("success");
            onSuccess(res.user);
        } catch (err) {
            setStep("error");
            setErrorMsg(err.response?.data?.error || "Gagal menautkan Google. Coba lagi.");
        }
    };

    const handleRetry = () => {
        setStep("idle");
        setErrorMsg("");
        setTimeLeft(0);
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    const isGoogle = provider === "google";
    const providerLabel = isGoogle ? "Google" : "Telegram";
    const providerColor = isGoogle ? "text-blue-400" : "text-sky-400";
    const providerBg = isGoogle ? "bg-blue-500/10" : "bg-sky-500/10";

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={step !== "loading" ? onClose : undefined}
            />

            <div className="relative w-full max-w-sm bg-primary border border-custom rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
                {step !== "loading" && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-secondary transition text-secondary"
                    >
                        <X size={16} />
                    </button>
                )}

                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${providerBg}`}>
                        <span className={`text-lg font-bold ${providerColor}`}>
                            {isGoogle ? "G" : "TG"}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-primary font-semibold text-sm">Tautkan {providerLabel}</h2>
                        <p className="text-secondary text-xs">Hubungkan ke akun Second Brain kamu</p>
                    </div>
                </div>

                <div className="border-t border-custom" />

                {step === "idle" && (
                    <div className="flex flex-col gap-3">
                        <p className="text-secondary text-sm">
                            {isGoogle
                                ? "Pilih akun Google yang ingin kamu tautkan. Pastikan akun ini belum digunakan di akun lain."
                                : "Klik tombol di bawah, lalu konfirmasi di Telegram Bot untuk menautkan akunmu."}
                        </p>
                        {isGoogle ? (
                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => {
                                        setStep("error");
                                        setErrorMsg("Login Google gagal. Coba lagi.");
                                    }}
                                />
                            </div>
                        ) : (
                            <button
                                onClick={handleRequestTelegram}
                                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium text-sm transition flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={16} />
                                Buka Telegram Bot
                            </button>
                        )}
                    </div>
                )}

                {step === "loading" && (
                    <div className="flex flex-col items-center gap-3 py-4">
                        <Loader2 size={32} className="animate-spin text-primary" />
                        <p className="text-secondary text-sm">Memproses...</p>
                    </div>
                )}

                {step === "waiting" && (
                    <div className="flex flex-col gap-3">
                        <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl text-center">
                            <p className="text-sm font-medium text-primary mb-1">
                                ⏳ Menunggu konfirmasi Telegram
                            </p>
                            <p className="text-xs text-secondary mb-2">
                                Buka Telegram dan konfirmasi permintaan tautan
                            </p>
                            <p className="text-xs font-mono text-secondary">
                                Berakhir dalam: {formatTime(timeLeft)}
                            </p>
                            <Loader2 size={20} className="animate-spin text-sky-400 mx-auto mt-3" />
                        </div>
                        <button
                            onClick={() => window.open(telegramUrl, "_blank")}
                            className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium text-sm transition flex items-center justify-center gap-2"
                        >
                            <ExternalLink size={16} />
                            Buka Telegram Lagi
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 border border-custom hover:bg-secondary text-secondary rounded-xl font-medium text-sm transition"
                        >
                            Batal
                        </button>
                    </div>
                )}

                {step === "success" && (
                    <div className="flex flex-col items-center gap-3 py-2">
                        <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle2 size={32} className="text-green-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-primary font-semibold text-sm">Berhasil!</p>
                            <p className="text-secondary text-xs mt-0.5">
                                Akun {providerLabel} berhasil ditautkan.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 btn-primary text-white rounded-xl font-medium text-sm transition"
                        >
                            Tutup
                        </button>
                    </div>
                )}

                {step === "error" && (
                    <div className="flex flex-col gap-3">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400">{errorMsg}</p>
                        </div>
                        <button
                            onClick={handleRetry}
                            className="w-full py-2.5 btn-primary text-white rounded-xl font-medium text-sm transition"
                        >
                            Coba Lagi
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 border border-custom hover:bg-secondary text-secondary rounded-xl font-medium text-sm transition"
                        >
                            Batal
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LinkAccountModal;