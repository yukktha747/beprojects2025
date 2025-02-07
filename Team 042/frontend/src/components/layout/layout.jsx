import api from "@/src/api/api";
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const validateToken = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  try {
    const response = await api.post(
      "http://localhost:3000/api/v1/client/auth/validate-token",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.isValid;
  } catch (error) {
    return false;
  }
};

function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await validateToken();
      setIsAuthenticated(isValid);
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth-signin" replace />;
  }

  return <Outlet />;
}

export default Layout;
