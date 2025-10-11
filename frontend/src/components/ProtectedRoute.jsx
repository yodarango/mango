import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect to login if no token found
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

