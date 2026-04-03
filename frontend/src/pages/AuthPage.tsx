import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiPost, getToken, setToken } from "../lib/api";

export function SignInPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (getToken()) navigate("/profile", { replace: true });
  }, [navigate]);

  async function submit() {
    setStatus("Working...");
    if (mode === "signup") {
      const r = await apiPost<{ token: string }>("/api/auth/signup", { email, password, displayName });
      if (!r.ok) return setStatus(r.error);
      setToken(r.data.token);
      setStatus("Signed up successfully.");
      navigate("/profile", { replace: true });
    } else {
      const r = await apiPost<{ token: string }>("/api/auth/login", { email, password });
      if (!r.ok) return setStatus(r.error);
      setToken(r.data.token);
      setStatus("Signed in successfully.");
      navigate("/profile", { replace: true });
    }
  }

  const isError = status.toLowerCase().includes("error") || status.toLowerCase().includes("invalid");

  return (
    <div className="cc-page cc-auth-page">
      <div className="cc-auth-grid">
        <section className={`cc-card cc-auth-hero ${mode === "signup" ? "cc-auth-hero--signup" : ""}`}>
          <div className="cc-auth-hero-content">
            <p className="cc-auth-kicker">CouponCare</p>
            <h2 className="cc-auth-title">Give coupons a second life.</h2>
            <p className="cc-auth-subtitle">
              Donate unused coupons, request what you need, and build trust through verified approvals.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="cc-tag">Donor approvals</span>
              <span className="cc-tag">Community trust</span>
              <span className="cc-tag">Fast requests</span>
            </div>
          </div>
        </section>

        <section className="cc-card cc-auth-panel">
          <div className="space-y-2">
            <p className="cc-auth-kicker">{mode === "login" ? "Welcome back" : "Create your account"}</p>
            <h1 className="cc-title">{mode === "login" ? "Sign in" : "Sign up"}</h1>
            <p className="cc-muted">
              {mode === "login"
                ? "Sign in to donate, request, and manage approvals."
                : "Create an account to donate coupons and request support."}
            </p>
          </div>

          <div className="cc-auth-toggle">
            <button
              className={mode === "login" ? "cc-btn-primary" : "cc-btn"}
              onClick={() => {
                setMode("login");
                setStatus("");
              }}
              type="button"
            >
              Sign in
            </button>
            <button
              className={mode === "signup" ? "cc-btn-primary" : "cc-btn"}
              onClick={() => {
                setMode("signup");
                setStatus("");
              }}
              type="button"
            >
              Create account
            </button>
          </div>

          {mode === "signup" ? (
            <label className="block text-sm">
              <div className="mb-1 text-white/70">Display name</div>
              <input
                className="cc-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
                placeholder="Your name"
              />
            </label>
          ) : null}

          <label className="block text-sm">
            <div className="mb-1 text-white/70">Email</div>
            <input
              className="cc-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>

          <label className="block text-sm">
            <div className="mb-1 text-white/70">Password</div>
            <input
              className="cc-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={mode === "login" ? "Enter your password" : "Create a strong password"}
            />
          </label>

          {mode === "login" ? (
            <div className="text-right text-xs">
              <Link className="text-white/60 hover:text-white" to="/forgot-password">
                Forgot password?
              </Link>
            </div>
          ) : null}

          <button className="cc-btn-primary" onClick={submit} type="button">
            {mode === "login" ? "Sign in" : "Create account"}
          </button>

          <p className="cc-muted">
            Browse is public. Donation and requests require sign in.{" "}
            <Link className="text-orange-300 hover:text-orange-200" to="/browse">
              Continue browsing
            </Link>
          </p>

          {status ? (
            <div className={`cc-alert ${isError ? "cc-alert-error" : ""}`}>{status}</div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);

  async function verifyIdentity() {
    if (!email.trim() || !displayName.trim()) {
      setStatus("Please enter your email and display name.");
      return;
    }
    setStatus("Verifying...");
    const r = await apiPost<{ ok: boolean }>("/api/auth/verify-reset", { email, displayName });
    if (!r.ok) return setStatus(r.error);
    setVerified(true);
    setStatus("Verified. Set a new password.");
  }

  async function submitReset() {
    if (!verified) return;
    if (!password || password.length < 8) {
      setStatus("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }
    setStatus("Updating password...");
    const r = await apiPost<{ message?: string }>("/api/auth/reset-password-direct", {
      email,
      displayName,
      password
    });
    if (!r.ok) return setStatus(r.error);
    setSent(true);
    setStatus(r.data.message ?? "Password updated successfully.");
  }

  const isError = status.toLowerCase().includes("error") || status.toLowerCase().includes("invalid");

  return (
    <div className="cc-page cc-auth-page">
      <div className="cc-auth-grid">
        <section className="cc-card cc-auth-hero">
          <div className="cc-auth-hero-content">
            <p className="cc-auth-kicker">CouponCare</p>
            <h2 className="cc-auth-title">Reset your access.</h2>
            <p className="cc-auth-subtitle">
              Verify your email and display name to set a new password.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="cc-tag">Identity check</span>
              <span className="cc-tag">Secure reset</span>
            </div>
          </div>
        </section>

        <section className="cc-card cc-auth-panel">
          <div className="space-y-2">
            <p className="cc-auth-kicker">Forgot password</p>
            <h1 className="cc-title">Reset password</h1>
            <p className="cc-muted">Confirm your identity and choose a new password.</p>
          </div>

          {!verified ? (
            <>
              <label className="block text-sm">
                <div className="mb-1 text-white/70">Email</div>
                <input
                  className="cc-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block text-sm">
                <div className="mb-1 text-white/70">Display name</div>
                <input
                  className="cc-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="name"
                  placeholder="Your display name"
                />
              </label>

              <button className="cc-btn-primary" onClick={verifyIdentity} type="button">
                Verify identity
              </button>
            </>
          ) : (
            <>
              <label className="block text-sm">
                <div className="mb-1 text-white/70">New password</div>
                <input
                  className="cc-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                />
              </label>

              <label className="block text-sm">
                <div className="mb-1 text-white/70">Confirm password</div>
                <input
                  className="cc-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Repeat the password"
                />
              </label>

              <button className="cc-btn-primary" onClick={submitReset} type="button" disabled={sent}>
                {sent ? "Password updated" : "Update password"}
              </button>
            </>
          )}

          <button className="cc-btn" onClick={() => navigate("/signin")} type="button">
            Back to sign in
          </button>

          {status ? (
            <div className={`cc-alert ${isError ? "cc-alert-error" : ""}`}>{status}</div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export { SignInPage as AuthPage };

