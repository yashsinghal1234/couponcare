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
  const [status, setStatus] = useState("");
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!email.trim()) {
      setStatus("Please enter your email.");
      return;
    }
    setStatus("Sending reset link...");
    const r = await apiPost<{ message?: string }>("/api/auth/forgot-password", { email });
    if (!r.ok) return setStatus(r.error);
    setSent(true);
    setStatus(r.data.message ?? "If an account exists, a reset link will be sent.");
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
              Enter the email tied to your account. We will send a reset link if it exists.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="cc-tag">Account security</span>
              <span className="cc-tag">Private reset</span>
            </div>
          </div>
        </section>

        <section className="cc-card cc-auth-panel">
          <div className="space-y-2">
            <p className="cc-auth-kicker">Forgot password</p>
            <h1 className="cc-title">Reset link</h1>
            <p className="cc-muted">We will email you a reset link if the account exists.</p>
          </div>

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

          <button className="cc-btn-primary" onClick={submit} type="button" disabled={sent}>
            {sent ? "Reset link sent" : "Send reset link"}
          </button>

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

