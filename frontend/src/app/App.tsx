import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router-dom";

import { clearToken, getToken, onAuthChanged } from "../lib/api";
import { SignInPage } from "../pages/AuthPage";
import { BrowseCouponsPage } from "../pages/BrowseCouponsPage";
import { CouponDetailPage } from "../pages/CouponDetailPage";
import { DonateCouponPage } from "../pages/DonateCouponPage";
import { IncomingRequestsPage } from "../pages/IncomingRequestsPage";
import { HomePage } from "../pages/HomePage";
import { ProfilePage } from "../pages/ProfilePage";

export function App() {
  const [isAuthed, setIsAuthed] = useState(Boolean(getToken()));
  useEffect(() => onAuthChanged(() => setIsAuthed(Boolean(getToken()))), []);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-1.5 text-sm transition ${isActive ? "bg-orange-500 text-black" : "text-white/75 hover:bg-white/10 hover:text-white"}`;

  return (
    <BrowserRouter>
      <div className="cc-shell">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/30 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
            <NavLink to="/" className="text-lg font-semibold tracking-tight text-white">
              CouponCare
            </NavLink>
            <nav className="flex items-center gap-2">
              <NavLink to="/browse" className={navClass}>
                Browse
              </NavLink>
              <NavLink to="/donate" className={navClass}>
                Donate
              </NavLink>
              <NavLink to="/requests" className={navClass}>
                Requests
              </NavLink>
              {isAuthed ? (
                <>
                  <NavLink to="/profile" className={navClass}>
                    Profile
                  </NavLink>
                  <button
                    className="rounded-full px-3 py-1.5 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
                    type="button"
                    onClick={() => clearToken()}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <NavLink to="/signin" className={navClass}>
                  Sign in
                </NavLink>
              )}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">
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
    </BrowserRouter>
  );
}

function ProtectedRoute({ children }: { children: ReactElement }) {
  if (!getToken()) {
    return <Navigate to="/signin" replace />;
  }
  return children;
}

