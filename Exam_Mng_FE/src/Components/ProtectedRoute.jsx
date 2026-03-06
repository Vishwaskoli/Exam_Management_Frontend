import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {

    axios.get("https://localhost:7248/api/User/check", {
      withCredentials: true
    })
    .then(() => {
      setAuthenticated(true);
      setLoading(false);
    })
    .catch(() => {
      setAuthenticated(false);
      setLoading(false);
    });

  }, []);

  if (loading) return <div>Loading...</div>;

  if (!authenticated) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;