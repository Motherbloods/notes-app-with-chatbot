import { useEffect } from "react";

function ConfirmModal({ onConfirm, onCancel, message }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                onCancel();
            }
        };

        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onCancel]);

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onCancel}
        >
            <div
                className="
        bg-primary
        w-full max-w-sm
        p-6
        rounded-xl
        shadow-lg
        border border-custom
        transition-colors
      "
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-primary mb-3">
                    Konfirmasi
                </h3>

                <p className="text-sm text-secondary mb-6">
                    {message || "Apakah Anda yakin ingin melanjutkan?"}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="
            px-4 py-2
            text-sm
            rounded-lg
            cursor-pointer
            bg-tertiary
            text-primary
            hover:bg-secondary
            transition-colors
          "
                    >
                        Batal
                    </button>

                    <button
                        onClick={onConfirm}
                        className="
            px-4 py-2
            text-sm
            rounded-lg
            cursor-pointer
            bg-red-600
            text-white
            hover:bg-red-700
            transition-colors
          "
                    >
                        Ya, Lanjutkan
                    </button>

                </div>
            </div>
        </div>
    );

}

export default ConfirmModal;
