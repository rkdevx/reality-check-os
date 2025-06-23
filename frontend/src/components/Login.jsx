import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/token/", credentials);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Invalid username or password");
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    const token = credentialResponse.credential;
    try {
      const res = await axios.post("http://localhost:8000/api/google-login/", { token });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;
      
      toast.success("Google login successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Google login failed");
      console.error(err);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">🧠 RealityCheck OS</h2>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              name="username" 
              className="form-control" 
              value={credentials.username} 
              onChange={handleChange} 
              required 
              placeholder="Enter your username"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              name="password" 
              className="form-control" 
              value={credentials.password} 
              onChange={handleChange} 
              required 
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>

        <hr className="my-4" />

        <div className="text-center">
          <p>Or continue with Google:</p>
          <GoogleLogin 
            onSuccess={handleGoogleLogin}
            onError={() => toast.error("Google login failed")}
          />
        </div>
      </div>
    </div>
  );
}
