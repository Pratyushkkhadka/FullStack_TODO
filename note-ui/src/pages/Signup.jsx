import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import apiClient from "../Api/ApiClient";

export default function Signup() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiClient.post("/auth/signup", formData);

      const loginRes = await apiClient.post("/auth/login", {
        identifier: formData.username,
        password: formData.password,
      });

      const token = typeof loginRes.data === "string" ? loginRes.data : loginRes.data.token;
      login(token);
      navigate("/");
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      setError(serverMsg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">Get Started</div>
          <h2>Create your account</h2>
          <p>Join now to manage your daily tasks and ideas in one place.</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSignup} className="form-group">
          <div className="input-container">
            <label>Username</label>
            <input
              name="username"
              className="input-field"
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-container">
            <label>Email Address</label>
            <input
              name="email"
              className="input-field"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-container">
            <label>Password</label>
            <input
              name="password"
              className="input-field"
              type="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating account..." : "Get Started →"}
          </button>
        </form>

        <div className="auth-footer">
          Already registered? <Link to="/login">Sign in to your account</Link>
        </div>
      </div>
    </div>
  );
}