import { React, useState, useEffect } from "react";
import {
  X,
  Check,
  AlertTriangle,
  CheckCircle2,
  Code2,
  RefreshCw,
  Loader2,
  FileText,
  Sparkles,
  Tag,
  FolderOpen,
} from "lucide-react";
import useSmartTextarea from "../hooks/useSmartTextarea";
import toast from "react-hot-toast";

function EditModal({ onClose, onSave, initialData }) {
  const defaultData = initialData || {};

  const [category, setCategory] = useState(defaultData.category || "catatan");
  const [inputContent, setInputContent] = useState(defaultData.content || "");
  const [inputTitle, setInputTitle] = useState(defaultData.title || "");
  const [inputFileContext, setInputFileContext] = useState(
    defaultData.fileContext || "",
  );
  const [showSuggested, setShowSuggested] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [reanalyze, setReanalyze] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { textareaRef, handleKeyDown } = useSmartTextarea(
    inputContent,
    setInputContent,
  );

  useEffect(() => {
    if (defaultData.content) {
      const cleanedContent = defaultData.content
        .replace(/\s*<!--completed:.*?-->/g, "")
        .replace(/\s*<!--failed-->/g, "");
      setInputContent(cleanedContent);
    }
  }, [defaultData.content]);

  // ESC untuk tutup
  useEffect(() => {
    const handleKeyUp = (e) => {
      if (e.key === "Escape" && !isSaving) onClose();
    };
    document.addEventListener("keyup", handleKeyUp);
    return () => document.removeEventListener("keyup", handleKeyUp);
  }, [isSaving, onClose]);

  if (!initialData) return null;

  const isCode = defaultData.contentType === "code";
  const categoryChanged = category !== defaultData.category;
  const hasOriginalContent =
    defaultData.originalContent &&
    defaultData.originalContent !== defaultData.content;
  const hasSuggestedCode =
    defaultData.suggestedCode &&
    defaultData.suggestedCode !== defaultData.content;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedNote = {
        _id: initialData._id,
        category,
        content: inputContent,
        title: inputTitle.trim() || null,
        contentType: initialData.contentType,
        ...(isCode && {
          fileContext: inputFileContext.trim() || null,
        }),
        ...(isCode &&
          !reanalyze &&
          !categoryChanged && {
            language: initialData.language,
            suggestedCode: initialData.suggestedCode,
            analysisErrors: initialData.analysisErrors,
            confidence: initialData.confidence,
          }),
        reanalyze: reanalyze || categoryChanged,
      };
      await onSave(updatedNote);
      toast.success("Berhasil Edit Note");
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("⚠️ Gagal menyimpan note. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSaving) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-secondary text-primary rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-5 border-b border-custom flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-primary">Edit Catatan</h3>
            <p className="text-xs text-secondary mt-0.5">
              Tekan{" "}
              <kbd className="px-1.5 py-0.5 bg-tertiary border border-custom rounded text-xs font-mono">
                Esc
              </kbd>{" "}
              untuk batalkan · klik di luar modal untuk menutup
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-tertiary transition-colors disabled:opacity-50"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="text-xs font-semibold text-secondary uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <Tag size={12} />
              Judul
            </label>
            <input
              type="text"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              disabled={isSaving}
              placeholder="Judul catatan (opsional)"
              className="w-full px-3 py-2 border border-custom rounded-lg bg-primary text-primary text-sm placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5 block">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSaving}
              className="w-full px-3 py-2 border border-custom rounded-lg bg-primary text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <option value="target_harian">📅 Target Harian</option>
              <option value="ide">💡 Ide</option>
              <option value="kode">💻 Kode</option>
              <option value="catatan">📝 Catatan</option>
            </select>
            {categoryChanged && (
              <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                <RefreshCw size={11} />
                Kategori berubah — catatan akan dianalisis ulang saat disimpan
              </p>
            )}
          </div>

          {isCode && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-secondary uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                  <FolderOpen size={12} />
                  File Context
                </label>
                <input
                  type="text"
                  value={inputFileContext}
                  onChange={(e) => setInputFileContext(e.target.value)}
                  disabled={isSaving}
                  placeholder="Deskripsi singkat fungsi kode ini..."
                  className="w-full px-3 py-2 border border-custom rounded-lg bg-primary text-primary text-sm placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Code2 size={14} className="text-green-600" />
                  <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {initialData.language || "N/A"}
                  </span>
                </div>
                {initialData.confidence != null && (
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {Math.round(initialData.confidence * 100)}% confidence
                  </span>
                )}
              </div>

              <div
                onClick={() => !isSaving && setReanalyze(!reanalyze)}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all select-none
                  ${reanalyze ? "border-blue-400 bg-blue-50" : "border-custom bg-primary hover:bg-tertiary"}
                  ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all
                  ${reanalyze ? "bg-blue-600 border-blue-600" : "border-custom bg-primary"}`}
                >
                  {reanalyze && (
                    <Check size={10} className="text-white" strokeWidth={3} />
                  )}
                </div>
                <RefreshCw
                  size={14}
                  className={reanalyze ? "text-blue-600" : "text-secondary"}
                />
                <span className="text-sm text-primary">
                  Analisis ulang kode untuk saran terbaru
                </span>
              </div>

              {initialData.analysisErrors?.length > 0 && (
                <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-3">
                    <AlertTriangle size={16} />
                    {initialData.analysisErrors.length} issue
                    {initialData.analysisErrors.length > 1 ? "s" : ""} ditemukan
                  </div>
                  <div className="space-y-2">
                    {initialData.analysisErrors.map((err, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-lg p-3 border border-amber-200"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              err.type === "error"
                                ? "bg-red-100 text-red-700"
                                : err.type === "warning"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {err.type}
                          </span>
                          <span className="text-xs text-secondary">
                            Line {err.line}
                          </span>
                        </div>
                        <p className="text-sm text-primary">{err.message}</p>
                        {err.fix && (
                          <div className="mt-2 bg-green-50 border border-green-200 rounded p-2">
                            <div className="flex items-center gap-1 text-xs text-green-700 font-medium mb-1">
                              <CheckCircle2 size={12} />
                              Suggested fix:
                            </div>
                            <code className="text-xs text-green-800 font-mono">
                              {err.fix}
                            </code>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="border-b border-custom">
            <div className="flex gap-0.5">
              <button
                onClick={() => {
                  setShowOriginal(false);
                  setShowSuggested(false);
                }}
                disabled={isSaving}
                className={`px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 rounded-t-lg ${
                  !showOriginal && !showSuggested
                    ? "text-primary bg-tertiary border-b-2 border-blue-500"
                    : "text-secondary hover:text-primary hover:bg-tertiary"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <FileText size={14} />
                  {isCode ? "Current" : "Edit"}
                </div>
              </button>

              {hasOriginalContent && (
                <button
                  onClick={() => {
                    setShowOriginal(true);
                    setShowSuggested(false);
                  }}
                  disabled={isSaving}
                  className={`px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 rounded-t-lg ${
                    showOriginal
                      ? "text-purple-600 bg-purple-50 border-b-2 border-purple-500"
                      : "text-secondary hover:text-primary hover:bg-tertiary"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <FileText size={14} />
                    Original
                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                      Raw
                    </span>
                  </div>
                </button>
              )}

              {isCode && hasSuggestedCode && (
                <button
                  onClick={() => {
                    setShowOriginal(false);
                    setShowSuggested(true);
                  }}
                  disabled={isSaving}
                  className={`px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 rounded-t-lg ${
                    showSuggested
                      ? "text-green-600 bg-green-50 border-b-2 border-green-500"
                      : "text-secondary hover:text-primary hover:bg-tertiary"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={14} />
                    AI Suggestion
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                      Fixed
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {showOriginal && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-start gap-2 text-sm text-purple-800">
                <FileText
                  size={14}
                  className="text-purple-600 mt-0.5 shrink-0"
                />
                <span>
                  <strong>Original Content</strong> — konten asli sebelum
                  diformat AI
                </span>
              </div>
            )}
            {showSuggested && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2 text-sm text-green-800">
                <Sparkles
                  size={14}
                  className="text-green-600 mt-0.5 shrink-0"
                />
                <span>
                  <strong>AI Suggestion</strong> — kode yang sudah diperbaiki AI
                </span>
              </div>
            )}

            <textarea
              ref={showOriginal || showSuggested ? null : textareaRef}
              value={
                showOriginal
                  ? initialData.originalContent
                  : showSuggested
                    ? initialData.suggestedCode
                    : inputContent
              }
              onChange={
                showOriginal || showSuggested
                  ? undefined
                  : (e) => setInputContent(e.target.value)
              }
              onKeyDown={
                showOriginal || showSuggested ? undefined : handleKeyDown
              }
              readOnly={showOriginal || showSuggested || isSaving}
              disabled={isSaving}
              className={`w-full p-3 border rounded-lg text-sm max-h-80 overflow-auto resize-none transition-colors
                ${isCode ? "font-mono" : ""}
                ${
                  showOriginal
                    ? "bg-purple-50 border-purple-300 text-purple-900 cursor-default"
                    : showSuggested
                      ? "bg-green-50 border-green-300 text-green-900 cursor-default"
                      : isSaving
                        ? "bg-tertiary border-custom cursor-not-allowed opacity-60"
                        : "bg-primary border-custom text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                }`}
              rows={12}
              style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
            />

            {hasOriginalContent && !showOriginal && !isCode && (
              <p className="text-xs text-secondary italic">
                💡 Konten ini sudah diformat otomatis. Klik tab "Original" untuk
                melihat versi aslinya.
              </p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-custom flex items-center justify-between shrink-0">
          <span className="text-xs text-secondary hidden sm:block">
            {isSaving ? "Menyimpan perubahan..." : "Perubahan belum tersimpan"}
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm border border-custom rounded-lg hover:bg-tertiary text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batalkan
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed font-medium"
            >
              {isSaving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Check size={15} />
                  Simpan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditModal;
