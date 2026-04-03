import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { apiGet, apiPost, getToken } from "../lib/api";
import { getBrandLogoSources } from "../lib/offerHelpers";

type Coupon = {
  id: string;
  brand: string;
  valueDescription: string;
  expiryDate: string;
  category: string;
  city?: string;
  restrictions?: string;
  brandLogoUrl?: string | null;
  productImageUrl?: string | null;
  revealMode: "donorApproval" | "autoRelease";
  showDonorName: boolean;
  donor?: { displayName: string };
  status: "available" | "claimed" | "expired";
  code?: string;
};

type BrandLogoProps = {
  sources: string[];
  brand: string;
  size?: "sm" | "lg";
};

function BrandLogo({ sources, brand, size = "lg" }: BrandLogoProps) {
  const [index, setIndex] = useState(0);
  const sourceKey = sources.join("|");
  useEffect(() => setIndex(0), [sourceKey]);
  const src = sources[index];
  const letter = brand.trim().slice(0, 1).toUpperCase() || "?";
  const isSmall = size === "sm";
  const imgClass = isSmall
    ? "h-5 w-5 rounded-sm bg-white object-contain"
    : "h-10 w-10 rounded-lg bg-white p-1.5 object-contain";
  const fallbackClass = isSmall
    ? "cc-brand-fallback cc-brand-fallback--sm"
    : "cc-brand-fallback cc-brand-fallback--lg";

  if (!src) {
    return (
      <span className={fallbackClass} title={brand}>
        {letter}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`${brand} logo`}
      className={imgClass}
      onError={() => setIndex((current) => current + 1)}
    />
  );
}

export function CouponDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState<{ message: string; tone: "info" | "success" | "error" } | null>(null);
  const toastTimeout = useRef<number | null>(null);

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

  useEffect(() => () => {
    if (toastTimeout.current) window.clearTimeout(toastTimeout.current);
  }, []);

  const showToast = (message: string, tone: "info" | "success" | "error" = "info") => {
    setToast({ message, tone });
    if (toastTimeout.current) window.clearTimeout(toastTimeout.current);
    toastTimeout.current = window.setTimeout(() => setToast(null), 3500);
  };

  async function requestCoupon() {
    if (!id) return;
    if (!getToken()) {
      navigate("/signin");
      return;
    }
    const r = await apiPost<{ request: { id: string; status: string } }>(`/api/coupons/${id}/requests`);
    if (!r.ok) {
      showToast(r.error, "error");
      return;
    }
    showToast(`Request ${r.data.request.status}`, "success");
    navigate("/requests");
  }

  if (!coupon) return <div className="cc-muted">{status || "Loading..."}</div>;

  const heroImage =
    coupon.productImageUrl ??
    coupon.brandLogoUrl ??
    "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1800&q=80";
  const logoSources = [coupon.brandLogoUrl, ...getBrandLogoSources(coupon.brand)].filter(
    (source): source is string => Boolean(source)
  );

  return (
    <div className="cc-page mx-auto w-full max-w-4xl space-y-6">
      {toast ? (
        <div className={`cc-toast cc-toast--${toast.tone}`} role="status">
          {toast.message}
        </div>
      ) : null}
      <div className="cc-card overflow-hidden">
        <div className="relative">
          <img src={heroImage} alt={coupon.brand} className="cc-media h-72 w-full object-cover md:h-96" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="space-y-4 p-6 md:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <BrandLogo sources={logoSources} brand={coupon.brand} size="lg" />
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{coupon.brand}</h1>
          </div>
          <div className="text-base text-white/85 md:text-lg">{coupon.valueDescription}</div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="cc-tag">Expires {new Date(coupon.expiryDate).toLocaleDateString()}</span>
            <span className="cc-tag">{coupon.category}</span>
            {coupon.city ? <span className="cc-tag">{coupon.city}</span> : null}
            {coupon.showDonorName && coupon.donor?.displayName ? (
              <span className="cc-tag">By {coupon.donor.displayName}</span>
            ) : null}
            <span className="cc-tag">Reveal {coupon.revealMode}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="cc-card p-5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">Restrictions</h3>
          <p className="mt-3 text-sm text-white/70">
            {coupon.restrictions || "No extra restrictions provided."}
          </p>
        </div>
        <div className="cc-card p-5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">Details</h3>
          <div className="mt-3 grid gap-2 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className="font-semibold text-white/85">{coupon.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Category</span>
              <span className="font-semibold text-white/85">{coupon.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Reveal mode</span>
              <span className="font-semibold text-white/85">{coupon.revealMode}</span>
            </div>
            {coupon.city ? (
              <div className="flex items-center justify-between">
                <span>City</span>
                <span className="font-semibold text-white/85">{coupon.city}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {coupon.code ? (
        <div className="cc-card p-5 text-sm">
          <div className="text-white/65">Coupon code (revealed)</div>
          <div className="mt-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-base text-white/90">
            {coupon.code}
          </div>
        </div>
      ) : (
        <div className="cc-card p-5 text-sm text-white/65">Code is hidden until eligible.</div>
      )}

      <div className="flex flex-wrap gap-2">
        <button className="cc-btn-primary" onClick={requestCoupon} type="button">
          I Need This
        </button>
        <button className="cc-btn" onClick={load} type="button">
          Refresh
        </button>
      </div>
    </div>
  );
}

