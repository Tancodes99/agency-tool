import { Navigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ children }) {

  const {
    user,
    loading,
  } = useAuth();

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center text-white">

        Loading...

      </div>
    );
  }

  return user
    ? children
    : <Navigate to="/login" />;
}

export default ProtectedRoute;