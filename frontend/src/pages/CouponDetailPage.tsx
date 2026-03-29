import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { apiGet, apiPost, getToken } from "../lib/api";
import { getBrandLogo } from "../lib/offerHelpers";

type Coupon = {
  id: string;
  brand: string;
  valueDescription: string;
  expiryDate: string;
  category: string;
  city?: string;
  restrictions?: string;
  revealMode: "donorApproval" | "autoRelease";
  showDonorName: boolean;
  donor?: { displayName: string };
  status: "available" | "claimed" | "expired";
  code?: string;
};

export function CouponDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [status, setStatus] = useState("");

  async function load() {
    if (!id) return;
    setStatus("Loading...");
    const r = await apiGet<{ coupon: Coupon }>(`/api/coupons/${id}`);
    if (!r.ok) return setStatus(r.error);
    setCoupon(r.data.coupon);
    setStatus("");
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function requestCoupon() {
    if (!id) return;
    if (!getToken()) {
      navigate("/signin");
      return;
    }
    setStatus("Requesting...");
    const r = await apiPost<{ request: { id: string; status: string } }>(`/api/coupons/${id}/requests`);
    if (!r.ok) return setStatus(r.error);
    setStatus(`Requested: ${r.data.request.status}`);
    navigate("/requests");
  }

  if (!coupon) return <div className="cc-muted">{status || "Loading..."}</div>;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="cc-card overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1400&q=80"
          alt={coupon.brand}
          className="h-48 w-full object-cover"
        />
        <div className="p-5">
          <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight">
            {getBrandLogo(coupon.brand) ? <img src={getBrandLogo(coupon.brand)!} alt={`${coupon.brand} logo`} className="h-8 w-8 rounded bg-white p-1" /> : null}
            <span>{coupon.brand}</span>
          </h1>
          <div className="mt-1 text-base text-white/85">{coupon.valueDescription}</div>
          <div className="mt-3 text-sm text-white/65">
            Expires: {new Date(coupon.expiryDate).toLocaleDateString()} • {coupon.category}
            {coupon.city ? ` • ${coupon.city}` : ""}
            {coupon.showDonorName && coupon.donor?.displayName ? ` • by ${coupon.donor.displayName}` : ""}
          </div>
          <div className="mt-3 inline-flex rounded-full border border-orange-400/50 bg-orange-500/10 px-3 py-1 text-xs text-orange-300">
            Reveal mode: {coupon.revealMode}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="cc-card p-4">
          <h3 className="text-sm font-semibold text-white">Restrictions</h3>
          <p className="mt-2 text-sm text-white/70">{coupon.restrictions || "No extra restrictions provided."}</p>
        </div>
        <div className="cc-card p-4">
          <h3 className="text-sm font-semibold text-white">Availability</h3>
          <p className="mt-2 text-sm text-white/70">Status: {coupon.status}</p>
          <p className="text-sm text-white/70">Category: {coupon.category}</p>
        </div>
      </div>

      {coupon.code ? (
        <div className="cc-card p-4 text-sm">
          <div className="text-white/65">Coupon code (revealed)</div>
          <div className="font-mono text-base">{coupon.code}</div>
        </div>
      ) : (
        <div className="cc-card p-4 text-sm text-white/65">Code is hidden until eligible.</div>
      )}

      <div className="flex flex-wrap gap-2">
        <button className="cc-btn-primary" onClick={requestCoupon} type="button">
          I Need This
        </button>
        <button className="cc-btn" onClick={load} type="button">
          Refresh
        </button>
      </div>

      {status ? <div className="rounded-xl bg-black/30 p-3 text-sm text-white/80">{status}</div> : null}
    </div>
  );
}

