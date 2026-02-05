import { ArrowDown } from "lucide-react";

function ScrollToBottomButton({ visible, onClick }) {
    if (!visible) {
        return null;
    }
    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 right-1/2 bg-blue-600 text-white
               p-3 rounded-full shadow-lg hover:bg-blue-700
               transition-all duration-300"
            aria-label="Scroll ke bawah"
        >
            <ArrowDown size={20} />
        </button>
    );
}

export default ScrollToBottomButton;