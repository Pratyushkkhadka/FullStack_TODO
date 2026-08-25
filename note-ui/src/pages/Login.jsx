import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import apiClient from "../Api/ApiClient";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiClient.post("/auth/login", { identifier, password });
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log in. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <span className="auth-badge">WELCOME BACK</span>
          <h2>Access your workspace</h2>
          <p>Organize, plan, and keep track of your notes seamlessly.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form-group">
          <div className="input-block">
            <label>USERNAME OR EMAIL</label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. admin1 or user@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="input-block">
            <label>PASSWORD</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: "1rem", textAlign: "center" }}>
          <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#a855f7", textDecoration: "none" }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}