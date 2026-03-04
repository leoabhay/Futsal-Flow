import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const location = useLocation();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboards if role not authorized
    const redirectMap = {
      admin: "/admin/dashboard",
      owner: "/owner/dashboard",
      user: "/dashboard",
    };
    return <Navigate to={redirectMap[user.role] || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;
