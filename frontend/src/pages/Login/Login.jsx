import { useState } from "react";
import { Link } from "react-router-dom";

import { login } from "../../services/authService";
import { getAuthErrorMessage } from "../Auth/authErrors";
import "../Auth/Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setErrorType(null);
    setMessage("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setErrorType("required");
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorType("email");
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      await login({
        email: cleanEmail,
        password,
      });

      setMessage(
        "Your sign-in request was accepted. Account session integration is not yet available."
      );
    } catch (err) {
      setErrorType("server");
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page" aria-labelledby="login-title">
      <div className="auth-card">
        <p className="auth-eyebrow">MUSICVAULT</p>

        <h1 id="login-title">Welcome Back</h1>

        <p className="auth-description">
          Sign in to continue discovering music that matches your taste.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              aria-invalid={
                errorType === "email" ||
                (errorType === "required" && !email.trim())
              }
              aria-describedby={
                errorType === "email" ||
                (errorType === "required" && !email.trim())
                  ? "login-error"
                  : undefined
              }
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
                setErrorType(null);
              }}
              disabled={submitting}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              aria-invalid={errorType === "required" && !password}
              aria-describedby={
                errorType === "required" && !password
                  ? "login-error"
                  : undefined
              }
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
                setErrorType(null);
              }}
              disabled={submitting}
              required
            />
          </div>

          {error && (
            <p id="login-error" className="auth-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="auth-message" role="status">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={submitting}
          >
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          New to MusicVault?{" "}
          <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
