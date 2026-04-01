import { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { apiPost } from "../lib/api";
import { getBrandLogo, getOfferImage, improveOfferText } from "../lib/offerHelpers";
import { detectCoupon, detectRewardSource, type CouponCategory, type CouponType, type CouponSource } from "../lib/detectCoupon";

const categories = ["Food", "Grocery", "Entertainment", "Shopping", "Travel", "Payment", "Other"] as const;
const couponTypes = ["Percentage", "FlatAmount", "Cashback", "FreeShipping", "BuyOne", "OtherDeal"] as const;
const revealModes = ["donorApproval", "autoRelease"] as const;
const rewardSources = ["RegularPromo", "HDFCHupi", "PaytmReward", "UPIReward", "DirectBrandReward", "CreditCardReward", "Other"] as const;

export function DonateCouponPage() {
  const navigate = useNavigate();

  // Stage 1: Paste & Detection
  const [pasteInput, setPasteInput] = useState("");
  const [detection, setDetection] = useState(detectCoupon(""));
  const [stage, setStage] = useState<"paste" | "confirm">("paste");

  // Stage 2: Confirm & Fill
  const [brand, setBrand] = useState("");
  const [code, setCode] = useState("");
  const [valueDescription, setValueDescription] = useState("");
  const [couponType, setCouponType] = useState<CouponType>("FlatAmount");
  const [expiryDate, setExpiryDate] = useState("");
  const [category, setCategory] = useState<CouponCategory>("Food");
  const [city, setCity] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [revealMode, setRevealMode] = useState<(typeof revealModes)[number]>("donorApproval");
  const [showDonorName, setShowDonorName] = useState(true);
  const [attestPaymentApp, setAttestPaymentApp] = useState(false);
  // Reward coupon fields
  const [isReward, setIsReward] = useState(false);
  const [rewardSource, setRewardSource] = useState<CouponSource>("RegularPromo");
  const [rewardTransferable, setRewardTransferable] = useState(true);
  const [rewardAttestation, setRewardAttestation] = useState(false);
  const [status, setStatus] = useState("");
  const [showOptional, setShowOptional] = useState(false);

  const logo = useMemo(() => getBrandLogo(brand), [brand]);
  const previewImage = useMemo(() => getOfferImage(brand, `${valueDescription} ${restrictions}`), [brand, restrictions, valueDescription]);

  // Stage 1: Detect from input
  function handlePasteInput(text: string) {
    setPasteInput(text);
    const result = detectCoupon(text);
    setDetection(result);
  }

  // Stage 1 → Stage 2: Move to confirm with detected values
  function moveToConfirm() {
    if (!detection.brand) {
      setStatus("Please type or paste coupon details with a recognizable brand name.");
      return;
    }

    // Populate stage 2 with detected values
    setBrand(detection.brand);
    setCategory(detection.category);
    setCouponType(detection.type);
    setCode(""); // User still fills this
    setValueDescription(detection.suggestedDescription || "");
    setRestrictions("");
    setCity("");
    setExpiryDate("");
    
    // Handle reward coupon detection
    if (detection.isReward) {
      setIsReward(true);
      setRewardSource(detection.rewardSource || "RegularPromo");
      setRewardTransferable(detection.transferable);
      setRewardAttestation(false);
    } else {
      setIsReward(false);
    }

    if (detection.isPaymentApp) {
      setAttestPaymentApp(false);
    }

    setStatus("");
    setStage("confirm");
  }

  // Stage 2 → Stage 1: Back button
  function backToStage1() {
    setStage("paste");
  }

  // Submit final coupon
  async function submit() {
    if (!code.trim()) {
      setStatus("Please enter the coupon code.");
      return;
    }
    if (!expiryDate) {
      setStatus("Please set an expiry date.");
      return;
    }
    if (detection.isPaymentApp && !attestPaymentApp) {
      setStatus("Please confirm that this code is transferable before donating.");
      return;
    }
    if (isReward && rewardTransferable && !rewardAttestation) {
      setStatus("Please confirm that this reward is available in your account.");
      return;
    }

    setStatus("Submitting...");
    const polishedValue = improveOfferText(valueDescription);
    const polishedRestrictions = improveOfferText(restrictions);

    const r = await apiPost<{ coupon: { id: string } }>("/api/coupons", {
      brand,
      code: code.trim(),
      valueDescription: polishedValue || valueDescription,
      couponType,
      expiryDate,
      category,
      city: city || undefined,
      restrictions: polishedRestrictions || restrictions || undefined,
      revealMode,
      showDonorName,
      isReward: isReward || undefined,
      rewardSource: isReward ? rewardSource : undefined,
      rewardTransferable: isReward ? rewardTransferable : undefined,
    });

    if (!r.ok) return setStatus(r.error);
    setStatus(`Created coupon: ${r.data.coupon.id}`);
    navigate(`/coupons/${r.data.coupon.id}`);
  }

  // ─── STAGE 1: Paste & Detect ──────────────────────────────────────
  if (stage === "paste") {
    const confidencePercent = detection.confidence;
    const brandTags = detection.brand ? (
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600/30 border border-brand-500 text-brand-200 text-xs font-semibold px-3 py-1">
          ✓ Brand: {detection.brand}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-600/30 border border-violet-500 text-violet-200 text-xs font-semibold px-3 py-1">
          ✓ {detection.category}
        </span>
        {detection.isPaymentApp && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/30 border border-red-500 text-red-200 text-xs font-semibold px-3 py-1">
            ⚠ Payment App
          </span>
        )}
      </div>
    ) : null;

    return (
      <div className="mx-auto max-w-2xl">
        <div>
          <h1 className="cc-title">Donate a coupon</h1>
          <p className="cc-muted mt-1">Paste or type your coupon code. We'll auto-detect everything else.</p>
        </div>

        {/* Paste Input */}
        <div className="cc-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Paste coupon code or details</label>
            <textarea
              className="cc-input font-mono text-sm resize-none h-24"
              placeholder="e.g., SWIGGY50 or ₹100 off on orders above ₹299 using Swiggy... or even just 'zomato 50% off'"
              value={pasteInput}
              onChange={(e) => handlePasteInput(e.target.value)}
              spellCheck="false"
            />
          </div>

          {/* Confidence Bar */}
          {pasteInput.trim() && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/60">Detection confidence</span>
                <span className={`text-xs font-semibold ${confidencePercent >= 70 ? "text-green-400" : confidencePercent >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                  {confidencePercent}%
                </span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 ${confidencePercent >= 70 ? "bg-green-500" : confidencePercent >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Detected Tags */}
          {brandTags}

          {/* Warning */}
          {detection.warning && (
            <div className="bg-red-600/20 border border-red-500/40 rounded-lg p-3 text-sm text-red-200">
              {detection.warning}
            </div>
          )}

          {/* CTA */}
          {pasteInput.trim() && (
            <button
              className="cc-btn-primary w-full"
              onClick={moveToConfirm}
              disabled={!detection.brand}
            >
              Next → Confirm details
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── STAGE 2: Confirm & Fill ─────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl">
      <button
        className="mb-3 text-xs text-white/60 hover:text-white/90 flex items-center gap-1"
        onClick={backToStage1}
      >
        ← Back to paste
      </button>

      {/* Preview */}
      {brand && (
        <div className="cc-card overflow-hidden mb-4">
          <img src={previewImage} alt="Offer preview" className="h-40 w-full object-cover" />
        </div>
      )}

      <div className="cc-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">Confirm & complete</h2>
          <p className="text-sm text-white/60 mt-1">We detected the brand automatically. Fill in the rest.</p>
        </div>

        {logo && (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 bg-black/30">
            <img src={logo} alt={brand} className="h-4 w-4 rounded-sm bg-white" />
            {brand} detected
          </div>
        )}

        {/* Main fields grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
          {/* Brand (read-only display) */}
          <div className="sm:col-span-2">
            <label className="block text-sm">
              <div className="mb-1 text-white/70">Brand</div>
              <input className="cc-input bg-black/40" value={brand} disabled />
            </label>
          </div>

          {/* Category */}
          <label className="block text-sm">
            <div className="mb-1 text-white/70">Category</div>
            <select className="cc-input" value={category} onChange={(e) => setCategory(e.target.value as CouponCategory)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          {/* Coupon Type */}
          <label className="block text-sm">
            <div className="mb-1 text-white/70">Type</div>
            <select className="cc-input" value={couponType} onChange={(e) => setCouponType(e.target.value as CouponType)}>
              {couponTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          {/* Coupon Code (required) */}
          <label className="block text-sm sm:col-span-2">
            <div className="mb-1 text-white/70">
              Coupon code <span className="text-red-400">*</span>
            </div>
            <input
              className="cc-input font-mono"
              placeholder="e.g., SWIGGY50 or Z123ABC"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </label>

          {/* Value Description (from suggested) */}
          <label className="block text-sm sm:col-span-2">
            <div className="mb-1 text-white/70">What does it offer?</div>
            <input
              className="cc-input"
              placeholder="e.g., ₹100 off on orders above ₹299"
              value={valueDescription}
              onChange={(e) => setValueDescription(e.target.value)}
              onBlur={() => setValueDescription((v) => improveOfferText(v))}
            />
          </label>

          {/* Expiry Date (required) */}
          <label className="block text-sm">
            <div className="mb-1 text-white/70">
              Expiry date <span className="text-red-400">*</span>
            </div>
            <input className="cc-input" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </label>

          {/* City (optional) */}
          <label className="block text-sm">
            <div className="mb-1 text-white/70">City (optional)</div>
            <input className="cc-input" placeholder="Delhi, Mumbai, etc." value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
        </div>

        {/* Optional fields collapse */}
        <details className="border border-white/10 rounded-lg p-3 group">
          <summary className="text-sm font-medium text-white/80 cursor-pointer flex items-center gap-2">
            <span className="group-open:rotate-180 transition-transform inline-block">▶</span>
            Additional details (optional)
          </summary>
          <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
            <label className="block text-sm">
              <div className="mb-1 text-white/70">Restrictions</div>
              <input
                className="cc-input"
                placeholder="e.g., Not valid on alcohol, minimum spend ₹500"
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                onBlur={() => setRestrictions((v) => improveOfferText(v))}
              />
            </label>

            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showDonorName}
                  onChange={(e) => setShowDonorName(e.target.checked)}
                />
                <span className="text-white/80">Show my name on listing</span>
              </label>

              <label className="flex items-center gap-2">
                <select
                  className="cc-input text-xs py-1 px-2"
                  value={revealMode}
                  onChange={(e) => setRevealMode(e.target.value as any)}
                >
                  {revealModes.map((m) => (
                    <option key={m} value={m}>
                      {m === "donorApproval" ? "I approve requests" : "Auto-release code"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </details>

        {/* Reward Coupon Detection & Fields */}
        <div className="border border-white/10 rounded-lg p-4 space-y-3 bg-violet-600/10">
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Is this a reward or cashback coupon?</h3>
            <p className="text-xs text-white/60 mb-3">Reward coupons come from credit cards, UPI apps, or brand loyalty programs (e.g., HDFC Hupi, Paytm rewards, Lenskart)</p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isReward}
                onChange={(e) => setIsReward(e.target.checked)}
              />
              <span className="text-white/80">Yes, this is a reward or cashback coupon</span>
            </label>
          </div>

          {isReward && (
            <div className="space-y-3 pt-2 border-t border-white/20">
              <label className="block text-sm">
                <div className="mb-1 text-white/70">Where is this reward from?</div>
                <select 
                  className="cc-input text-sm" 
                  value={rewardSource} 
                  onChange={(e) => setRewardSource(e.target.value as CouponSource)}
                >
                  <option value="RegularPromo">Regular Promo Code</option>
                  <option value="HDFCHupi">HDFC Hupi Reward</option>
                  <option value="PaytmReward">Paytm Cashback/Reward</option>
                  <option value="UPIReward">UPI App Reward (Google Pay, PhonePe, etc.)</option>
                  <option value="CreditCardReward">Credit Card Reward Points</option>
                  <option value="DirectBrandReward">Brand Loyalty/Direct Reward</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={rewardTransferable}
                  onChange={(e) => setRewardTransferable(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-white/80">
                  This reward code can be transferred to another person (account-independent)
                </span>
              </label>

              {rewardTransferable && (
                <label className="flex items-start gap-2 text-sm bg-green-600/20 border border-green-500/40 rounded p-3">
                  <input
                    type="checkbox"
                    checked={rewardAttestation}
                    onChange={(e) => setRewardAttestation(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-green-200">
                    I confirm this reward is in my account and available for transfer to the recipient.
                  </span>
                </label>
              )}

              {!rewardTransferable && (
                <div className="bg-yellow-600/20 border border-yellow-500/40 rounded p-3 text-xs text-yellow-200">
                  ⚠ <strong>Note:</strong> Account-bound rewards may require your help to redeem. Recipient may need you to make the purchase on their behalf.
                </div>
              )}
            </div>
          )}
        </div>

        {detection.isPaymentApp && (
          <div className="bg-red-600/20 border border-red-500/40 rounded-lg p-4 space-y-3">
            <p className="text-sm text-red-200 font-medium">{detection.warning}</p>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={attestPaymentApp}
                onChange={(e) => setAttestPaymentApp(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-white/80">
                I confirm this code is <strong>transferable</strong> and works on any account.
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Submit */}
      <button className="cc-btn-primary w-full mt-4" onClick={submit} type="button">
        Donate coupon
      </button>

      {status && (
        <div className={`mt-3 rounded-xl p-3 text-sm ${status.includes("Submitting") ? "bg-blue-600/20 text-blue-200" : status.includes("Created") ? "bg-green-600/20 text-green-200" : "bg-red-600/20 text-red-200"}`}>
          {status}
        </div>
      )}
    </div>
  );
}

