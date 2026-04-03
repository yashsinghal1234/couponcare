import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiGet } from "../lib/api";
import { getBrandLogoSources } from "../lib/offerHelpers";

type CouponListItem = {
  id: string;
  brand: string;
  valueDescription: string;
  expiryDate: string;
  category: string;
  city?: string;
  brandLogoUrl?: string | null;
  productImageUrl?: string | null;
  revealMode: "donorApproval" | "autoRelease";
  showDonorName: boolean;
  donor?: { displayName?: string; trustScore?: number | null };
  status: "available" | "claimed" | "expired";
};

const couponImages = [
  "https://images.unsplash.com/photo-1545231027-637d2f6210f8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
];

type BrandLogoProps = {
  sources: string[];
  brand: string;
  size?: "sm" | "lg";
};

function BrandLogo({ sources, brand, size = "sm" }: BrandLogoProps) {
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

export function BrowseCouponsPage() {
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState("");
  const [items, setItems] = useState<CouponListItem[]>([]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (brand) p.set("brand", brand);
    if (city) p.set("city", city);
    const qs = p.toString();
    return qs ? `?${qs}` : "";
  }, [brand, category, city]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus("Loading...");
      const r = await apiGet<{ coupons: CouponListItem[] }>(`/api/coupons${query}`);
      if (!r.ok) return setStatus(r.error);
      if (cancelled) return;
      setItems(r.data.coupons);
      setStatus(`Loaded ${r.data.coupons.length}`);
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="cc-page space-y-4">
      <div>
        <h1 className="cc-title">Browse coupons</h1>
        <p className="cc-muted mt-1">Find active coupons sorted by nearest expiry.</p>
      </div>

      <div className="cc-card grid grid-cols-1 gap-2 p-4 sm:grid-cols-3">
        <label className="block text-sm">
          <div className="mb-1 text-white/70">Category</div>
          <input className="cc-input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Food" />
        </label>
        <label className="block text-sm">
          <div className="mb-1 text-white/70">Brand</div>
          <input className="cc-input" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Domino's" />
        </label>
        <label className="block text-sm">
          <div className="mb-1 text-white/70">City</div>
          <input className="cc-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" />
        </label>
      </div>

      {status ? <div className="cc-muted">{status}</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((c, idx) => {
          const logoSources = [c.brandLogoUrl, ...getBrandLogoSources(c.brand)].filter(
            (source): source is string => Boolean(source)
          );
          const heroImage = c.productImageUrl ?? couponImages[idx % couponImages.length];

          return (
            <article key={c.id} className="cc-card overflow-hidden">
              <img
                src={heroImage}
                alt={c.brand}
                className="cc-media h-36 w-full object-cover"
              />
              <div className="space-y-3 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                    <BrandLogo sources={logoSources} brand={c.brand} size="sm" />
                    <span>{c.brand}</span>
                  </div>
                  <div className="text-sm text-white/80">{c.valueDescription}</div>
                  <div className="mt-1 text-sm text-white/65">
                    Expires: {new Date(c.expiryDate).toLocaleDateString()} • {c.category}
                  </div>
                  <div className="text-sm text-white/65">
                    {c.city ? `${c.city} • ` : ""}
                    {c.showDonorName && c.donor?.displayName ? `by ${c.donor.displayName}` : "Anonymous donor"}
                  </div>
                  {typeof c.donor?.trustScore === "number" ? (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                      <span className="uppercase tracking-[0.2em] text-white/50">Trust</span>
                      <span className="text-white">{Math.round(c.donor.trustScore)}%</span>
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-orange-400/50 bg-orange-500/10 px-2 py-1 text-xs text-orange-300">{c.revealMode}</span>
                  <Link className="cc-btn" to={`/coupons/${c.id}`}>
                    View details
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!items.length ? (
        <div className="cc-card p-6 text-center text-sm text-white/65">No available coupons found.</div>
      ) : null}
    </div>
  );
}

