import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiGet, apiPost, getToken, setToken } from "../lib/api";

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

  async function loadMe() {
    setStatus("Loading /me...");
    const r = await apiGet<{ user: { email: string; displayName: string } }>("/api/auth/me");
    if (!r.ok) return setStatus(r.error);
    setStatus(`Me: ${r.data.user.displayName} (${r.data.user.email})`);
  }

  return (
    <div className="cc-page grid gap-5 md:grid-cols-2">
      <section className="cc-card overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80"
          alt="People sharing support"
          className="cc-media h-52 w-full object-cover md:h-full"
        />
      </section>

      <section className="space-y-4">
        <div>
          <h1 className="cc-title">Sign in to CouponCare</h1>
          <p className="cc-muted mt-1">Sign in is required to donate coupons, send requests, and manage approvals.</p>
        </div>

        <div className="cc-card space-y-4 p-5">
          <div className="flex gap-2 text-sm">
            <button
              className={mode === "login" ? "cc-btn-primary" : "cc-btn"}
              onClick={() => setMode("login")}
              type="button"
            >
              Sign in
            </button>
            <button
              className={mode === "signup" ? "cc-btn-primary" : "cc-btn"}
              onClick={() => setMode("signup")}
              type="button"
            >
              Create account
            </button>
          </div>

          {mode === "signup" ? (
            <label className="block text-sm">
              <div className="mb-1 text-white/70">Display name</div>
              <input className="cc-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </label>
          ) : null}

          <label className="block text-sm">
            <div className="mb-1 text-white/70">Email</div>
            <input className="cc-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label className="block text-sm">
            <div className="mb-1 text-white/70">Password</div>
            <input className="cc-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          <div className="flex flex-wrap gap-2">
            <button className="cc-btn-primary" onClick={submit} type="button">
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
            <button className="cc-btn" onClick={loadMe} type="button">
              Check profile
            </button>
          </div>

          <p className="cc-muted">
            Browse is public. Donation and requests require sign in.{" "}
            <Link className="text-orange-300 hover:text-orange-200" to="/browse">
              Continue browsing
            </Link>
          </p>

          {status ? <div className="rounded-xl bg-black/30 p-3 text-sm text-white/80">{status}</div> : null}
        </div>
      </section>
    </div>
  );
}

export { SignInPage as AuthPage };

