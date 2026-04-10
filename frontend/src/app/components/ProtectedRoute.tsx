import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }: any) {
  const { user, loading } = useAuth();

  // ⏳ Wait until user loads (prevents refresh redirect)
  if (loading) {
    return <div>Loading...</div>;
  }

  // ❌ If not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ If logged in → show page
  return children;
}