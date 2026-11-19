import { useState } from "react";
import { Link } from "react-router-dom";

import { register } from "../../services/authService";
import { getAuthErrorMessage } from "../Auth/authErrors";
import "../Auth/Auth.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (!cleanEmail || !password || !confirmPassword) {
      setErrorType("required");
      setError("Please complete all registration fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorType("email");
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorType("password-length");
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorType("password-match");
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        email: cleanEmail,
        password,
      });

      setMessage(
        "Your registration request was accepted. Account activation and sign-in are not yet available."
      );
    } catch (err) {
      setErrorType("server");
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page" aria-labelledby="register-title">
      <div className="auth-card">
        <p className="auth-eyebrow">MUSICVAULT</p>

        <h1 id="register-title">Create Your Account</h1>

        <p className="auth-description">
          Join MusicVault and start discovering music
          that matches your taste.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              aria-invalid={
                errorType === "email" ||
                (errorType === "required" && !email.trim())
              }
              aria-describedby={
                errorType === "email" ||
                (errorType === "required" && !email.trim())
                  ? "register-error"
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
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
                setErrorType(null);
              }}
              disabled={submitting}
              required
              minLength={8}
              aria-invalid={
                errorType === "password-length" ||
                (errorType === "required" && !password)
              }
              aria-describedby={
                errorType === "password-length" ||
                (errorType === "required" && !password)
                  ? "register-password-help register-error"
                  : "register-password-help"
              }
            />
            <p id="register-password-help" className="auth-help">
              Use at least 8 characters.
            </p>
          </div>

          <div className="auth-field">
            <label htmlFor="register-confirm-password">
              Confirm password
            </label>
            <input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={
                errorType === "password-match" ||
                (errorType === "required" && !confirmPassword)
              }
              aria-describedby={
                errorType === "password-match" ||
                (errorType === "required" && !confirmPassword)
                  ? "register-error"
                  : undefined
              }
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setError("");
                setErrorType(null);
              }}
              disabled={submitting}
              required
            />
          </div>

          {error && (
            <p id="register-error" className="auth-error" role="alert">
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
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
