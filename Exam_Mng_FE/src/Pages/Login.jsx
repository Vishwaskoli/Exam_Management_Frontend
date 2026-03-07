import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/axiosConfig";

const Login = () => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const res = await api.post("/User/login", formData);

      if (res.data.message === "Login Successful") {

        localStorage.setItem("token", res.data.token);

        navigate("/ResultMaster");
      } else {
        setMessage(res.data);
      }

    } catch (err) {
      setMessage("Login failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">

      <div className="card p-4 shadow" style={{ width: "400px" }}>

        <h3 className="text-center mb-3">Login</h3>

        {message && (
          <div className="alert alert-danger">{message}</div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label>Username</label>
            <input
              className="form-control"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn btn-primary w-100">
            Login
          </button>

        </form>

        <div className="text-center mt-3">
          <Link to="/" className="text-primary fw-bold">Register</Link>
          {" "}new Account
        </div>

      </div>

    </div>
  );
};

export default Login;