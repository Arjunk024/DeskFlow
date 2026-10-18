
import { useState } from "react";
import { login, register, type AuthUser } from "../services/authService";
import "./Login.css";

interface LoginProps {
  onLogin: (token: string, user: AuthUser) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isRegistering) {
        const result = await register(fullName, email, password);
        setMessage(result.message);
        setIsRegistering(false);
        setPassword("");
      } else {
        const result = await login(email, password);
        onLogin(result.token, result.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">D</div>
          <span>DeskFlow</span>
        </div>

        <p className="auth-eyebrow">IT OPERATIONS PLATFORM</p>
        <h1>{isRegistering ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-subtitle">
          {isRegistering
            ? "Get started with your DeskFlow workspace."
            : "Sign in to manage tickets, assets, and maintenance."}
        </p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <label>
              Full name
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete={isRegistering ? "new-password" : "current-password"}
              minLength={isRegistering ? 8 : undefined}
              required
            />
          </label>

          <button className="auth-submit" disabled={loading} type="submit">
            {loading
              ? "Please wait..."
              : isRegistering
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegistering ? "Already have an account?" : "New to DeskFlow?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
              setMessage("");
            }}
          >
            {isRegistering ? "Sign in" : "Create account"}
          </button>
        </p>

        <p className="auth-footer">Secure access for your IT team</p>
      </section>
    </main>
  );
}
