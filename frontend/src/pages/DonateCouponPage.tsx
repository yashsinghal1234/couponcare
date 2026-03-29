import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiPost } from "../lib/api";
import { getBrandLogo, getOfferImage, improveOfferText } from "../lib/offerHelpers";

const categories = ["Food", "Grocery", "Entertainment", "Shopping", "Travel", "Other"] as const;
const revealModes = ["donorApproval", "autoRelease"] as const;

export function DonateCouponPage() {
  const navigate = useNavigate();
  const [brand, setBrand] = useState("");
  const [code, setCode] = useState("");
  const [valueDescription, setValueDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("Food");
  const [city, setCity] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [revealMode, setRevealMode] = useState<(typeof revealModes)[number]>("donorApproval");
  const [showDonorName, setShowDonorName] = useState(true);
  const [status, setStatus] = useState("");
  const logo = useMemo(() => getBrandLogo(brand), [brand]);
  const previewImage = useMemo(() => getOfferImage(brand, `${valueDescription} ${restrictions}`), [brand, restrictions, valueDescription]);

  async function submit() {
    setStatus("Submitting...");
    const polishedValue = improveOfferText(valueDescription);
    const polishedRestrictions = improveOfferText(restrictions);
    const r = await apiPost<{ coupon: { id: string } }>("/api/coupons", {
      brand,
      code,
      valueDescription: polishedValue || valueDescription,
      expiryDate,
      category,
      city: city || undefined,
      restrictions: polishedRestrictions || restrictions || undefined,
      revealMode,
      showDonorName
    });
    if (!r.ok) return setStatus(r.error);
    setStatus(`Created coupon: ${r.data.coupon.id}`);
    navigate(`/coupons/${r.data.coupon.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="cc-card overflow-hidden">
        <img src={previewImage} alt="Offer preview" className="h-44 w-full object-cover" />
      </div>
      <div>
        <h1 className="cc-title">Donate a coupon</h1>
        <p className="cc-muted mt-1">Share what you do not need before it expires.</p>
        {logo ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs text-white/80">
            <img src={logo} alt={`${brand} logo`} className="h-4 w-4 rounded-sm bg-white" />
            Brand logo loaded automatically
          </div>
        ) : null}
      </div>

      <div className="cc-card grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <label className="block text-sm">
          <div className="mb-1 text-white/70">Brand</div>
          <input className="cc-input" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </label>

        <label className="block text-sm">
          <div className="mb-1 text-white/70">Category</div>
          <select className="cc-input" value={category} onChange={(e) => setCategory(e.target.value as any)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm sm:col-span-2">
          <div className="mb-1 text-white/70">Coupon code</div>
          <input className="cc-input" value={code} onChange={(e) => setCode(e.target.value)} />
        </label>

        <label className="block text-sm sm:col-span-2">
          <div className="mb-1 text-white/70">Discount/value description</div>
          <input
            className="cc-input"
            value={valueDescription}
            onChange={(e) => setValueDescription(e.target.value)}
            onBlur={() => setValueDescription((v) => improveOfferText(v))}
          />
        </label>

        <label className="block text-sm">
          <div className="mb-1 text-white/70">Expiry date</div>
          <input className="cc-input" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        </label>

        <label className="block text-sm">
          <div className="mb-1 text-white/70">City (optional)</div>
          <input className="cc-input" value={city} onChange={(e) => setCity(e.target.value)} />
        </label>

        <label className="block text-sm sm:col-span-2">
          <div className="mb-1 text-white/70">Restrictions (optional)</div>
          <input
            className="cc-input"
            value={restrictions}
            onChange={(e) => setRestrictions(e.target.value)}
            onBlur={() => setRestrictions((v) => improveOfferText(v))}
          />
        </label>

        <div className="space-y-2 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm sm:col-span-2">
        <div className="font-medium">Reveal & identity settings</div>

        <label className="block">
          <div className="mb-1 text-white/70">Reveal mode</div>
          <select className="cc-input" value={revealMode} onChange={(e) => setRevealMode(e.target.value as any)}>
            {revealModes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showDonorName} onChange={(e) => setShowDonorName(e.target.checked)} />
          <span>Show my name on listing</span>
        </label>
        </div>
      </div>

      <button className="cc-btn-primary" onClick={submit} type="button">
        Create coupon
      </button>

      {status ? <div className="rounded-xl bg-black/30 p-3 text-sm text-white/80">{status}</div> : null}
    </div>
  );
}

