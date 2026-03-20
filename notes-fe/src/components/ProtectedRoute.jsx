import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LayoutSkeleton from "./LayoutSkeleton";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LayoutSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
