import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (user) {
        return <Navigate to="/notes/new" replace />;
    }

    return children;
};

export default PublicRoute;