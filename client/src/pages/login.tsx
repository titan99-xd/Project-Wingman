import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/admin-login.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5050/api/auth/login", {
        email,
        password,
      });

      const { token } = response.data;

      // Save token
      localStorage.setItem("token", token);

      // Redirect to admin dashboard
      navigate("/admin");
    } catch (err: unknown) {
      // Optional logging
      console.error("Login error:", err);

      // Safe error display
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <h2 className="admin-title">Admin Login</h2>

        {error && <p className="admin-error">{error}</p>}

        <label>Email</label>
        <input
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading} className="admin-login-btn">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}