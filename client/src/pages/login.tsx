import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Fetch the user data based on email
  const user = useQuery(api.users.getUserByEmail, { email });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (user && user.password === password) {
      localStorage.setItem("user", JSON.stringify(user));
      
      // Route based on role
      if (user.role === "admin") {
        navigate("/manager"); 
      } else {
        navigate("/gatekeeper"); 
      }
    } else {
      alert("Invalid credentials. Please check your email and password.");
    }
  };

  return (
    <div className="login-screen">
      <div className="login-panel">
        <div className="hospital-logo">🏥</div>
        <h1>SentryX</h1>
        <p className="subtitle">Staff Authentication</p>
        
        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="nurse1@hospital.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="login-action-btn">Sign In</button>
        </form>
        <div className="demo-hint">
          Demo: <strong>nurse(1-9)@hospital.com</strong> / <strong>password123</strong>
        </div>
      </div>
    </div>
  );
}