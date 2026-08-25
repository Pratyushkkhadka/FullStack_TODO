import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import apiClient from "../Api/ApiClient";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
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
      const res = await apiClient.post("/auth/register", {
        username,
        email,
        password,
      });

      login(res.data);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <span className="auth-badge">GET STARTED</span>
          <h2>Create your account</h2>
          <p>Join now to manage your daily tasks and ideas in one place.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form-group">
          <div className="input-block">
            <label>USERNAME</label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. admin1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-block">
            <label>EMAIL ADDRESS</label>
            <input
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Creating Account..." : "Get Started →"}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: "1rem", textAlign: "center" }}>
          <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Already registered?{" "}
            <Link to="/login" style={{ color: "#a855f7", textDecoration: "none" }}>
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}