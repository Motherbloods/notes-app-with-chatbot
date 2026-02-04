import { Link } from "react-router-dom";
function Sidebar() {
    return (
        <div className="w-64 h-full bg-gray-800 text-white p-4">
            <h3>Notes App</h3>
            <li><Link to="/">Tambah Notes</Link></li>
            <li><Link to="/chatbot">Chatbot</Link></li>
        </div>
    );
}

export default Sidebar;