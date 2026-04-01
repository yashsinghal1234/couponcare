import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation } from "react-router-dom";

import { clearToken, getToken, onAuthChanged } from "../lib/api";
import { SignInPage } from "../pages/AuthPage";
import { BrowseCouponsPage } from "../pages/BrowseCouponsPage";
import { CouponDetailPage } from "../pages/CouponDetailPage";
import { DonateCouponPage } from "../pages/DonateCouponPage";
import { IncomingRequestsPage } from "../pages/IncomingRequestsPage";
import { HomePage } from "../pages/HomePage";
import { ProfilePage } from "../pages/ProfilePage";

export function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function AppShell() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [isAuthed, setIsAuthed] = useState(Boolean(getToken()));
  useEffect(() => onAuthChanged(() => setIsAuthed(Boolean(getToken()))), []);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const cursor = document.createElement("div");
    cursor.className = "cc-cursor";
    document.body.appendChild(cursor);

    const move = (event: MouseEvent) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;

      const el = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
      const interactive = el?.closest("a, button, .cc-cursor-target") as HTMLElement | null;
      const isActive = Boolean(interactive);
      cursor.classList.toggle("cc-cursor--active", isActive);

      const isInvert =
        interactive?.classList.contains("cc-btn-primary") ||
        interactive?.classList.contains("cc-cta") ||
        interactive?.classList.contains("cc-nav-link-cta");
      cursor.classList.toggle("cc-cursor--invert", Boolean(isInvert));
    };

    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("mousemove", move);
      cursor.remove();
    };
  }, []);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `cc-nav-link ${isActive ? "cc-nav-link-active" : ""}`;

  return (
    <div className={`cc-shell ${isHome ? "cc-shell-home" : ""}`}>
      <header className="cc-header">
        <div className="cc-header-inner">
          <NavLink to="/" className="cc-logo">
            CouponCare
          </NavLink>
          <nav className="cc-nav">
            <NavLink to="/browse" className={navClass}>
              Browse
            </NavLink>
            <NavLink to="/donate" className={navClass}>
              Donate
            </NavLink>
            <NavLink to="/requests" className={navClass}>
              Requests
            </NavLink>
          </nav>
          <div className="cc-nav-actions">
            {isAuthed ? (
              <>
                <NavLink to="/profile" className={navClass}>
                  Profile
                </NavLink>
                <button className="cc-btn" type="button" onClick={() => clearToken()}>
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/signin" className="cc-nav-link-cta">
                Sign in
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/auth" element={<Navigate to="/signin" replace />} />
          <Route path="/donate" element={<ProtectedRoute><DonateCouponPage /></ProtectedRoute>} />
          <Route path="/browse" element={<BrowseCouponsPage />} />
          <Route path="/coupons/:id" element={<CouponDetailPage />} />
          <Route path="/requests" element={<ProtectedRoute><IncomingRequestsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactElement }) {
  if (!getToken()) {
    return <Navigate to="/signin" replace />;
  }
  return children;
}

