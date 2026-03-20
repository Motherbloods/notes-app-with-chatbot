import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LayoutSkeleton from "./LayoutSkeleton";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LayoutSkeleton />;
  }

  if (user) {
    return <Navigate to="/notes/new" replace />;
  }

  return children;
};

export default PublicRoute;
