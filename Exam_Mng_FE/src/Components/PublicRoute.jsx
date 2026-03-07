import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/axiosConfig";

const PublicRoute = ({ children }) => {

  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/User/check");
        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (authenticated === null) return <div>Loading...</div>;

  if (authenticated) return <Navigate to="/ResultMaster" />;

  return children;
};

export default PublicRoute;