import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import { getBrandLogo, improveOfferText } from "../lib/offerHelpers";
import { detectCoupon, type CouponCategory, type CouponType, type CouponSource } from "../lib/detectCoupon";

const categories: CouponCategory[] = ["Food", "Grocery", "Entertainment", "Shopping", "Travel", "Payment", "Other"];
const couponTypes: CouponType[] = ["Percentage", "FlatAmount", "Cashback", "FreeShipping", "BuyOne", "OtherDeal"];
const rewardSources: CouponSource[] = ["RegularPromo", "HDFCHupi", "PaytmReward", "UPIReward", "DirectBrandReward", "CreditCardReward", "Other"];

const COUPON_TYPE_COLORS: Record<CouponType, { bg: string; border: string; text: string; emoji: string }> = {
  Percentage: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", emoji: "📊" },
  FlatAmount: { bg: "bg-green-50", border: "border-green-300", text: "text-green-700", emoji: "💵" },
  Cashback: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", emoji: "💰" },
  FreeShipping: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700", emoji: "🚚" },
  BuyOne: { bg: "bg-pink-50", border: "border-pink-300", text: "text-pink-700", emoji: "🎁" },
  OtherDeal: { bg: "bg-gray-50", border: "border-gray-300", text: "text-gray-700", emoji: "🎯" },
};

const CATEGORY_COLORS: Record<CouponCategory, string> = {
  Food: "from-orange-400 to-red-500",
  Grocery: "from-green-400 to-emerald-500",
  Shopping: "from-purple-400 to-pink-500",
  Entertainment: "from-red-400 to-pink-500",
  Travel: "from-blue-400 to-cyan-500",
  Payment: "from-indigo-400 to-blue-500",
  Other: "from-gray-400 to-slate-500",
};

export function DonateCouponPage() {
  const navigate = useNavigate();

  // ─── State ────────────────────────────────
  const [stage, setStage] = useState<"paste" | "confirm">("paste");
  const [pasteInput, setPasteInput] = useState("");
  const [detection, setDetection] = useState(detectCoupon(""));
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Confirm stage fields
  const [code, setCode] = useState("");
  const [valueDescription, setValueDescription] = useState("");
  const [couponType, setCouponType] = useState<CouponType>("FlatAmount");
  const [category, setCategory] = useState<CouponCategory>("Food");
  const [expiryDate, setExpiryDate] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [city, setCity] = useState("");
  const [revealMode, setRevealMode] = useState<"donorApproval" | "autoRelease">("donorApproval");
  const [showDonorName, setShowDonorName] = useState(true);

  // Reward fields
  const [isReward, setIsReward] = useState(false);
  const [rewardSource, setRewardSource] = useState<CouponSource>("RegularPromo");
  const [rewardTransferable, setRewardTransferable] = useState(true);
  const [rewardAttestation, setRewardAttestation] = useState(false);

  const logo = useMemo(() => getBrandLogo(detection.brand), [detection.brand]);
  const confidencePercent = Math.round(detection.confidence * 100);

  // ─── Handlers ──────────────────────────────
  function handlePasteInput(text: string) {
    setPasteInput(text);
    const result = detectCoupon(text);
    setDetection(result);
    setStatus("");
  }

  function moveToConfirm() {
    if (!detection.brand) {
      setStatus("💭 Hmm, I couldn't detect a brand. Try typing something like 'Swiggy 50%' or 'Amazon ₹200'.");
      return;
    }
    setCategory(detection.category);
    setCouponType(detection.type);
    setValueDescription(detection.suggestedDescription || "");
    if (detection.isReward) {
      setIsReward(true);
      setRewardSource(detection.rewardSource || "RegularPromo");
      setRewardTransferable(detection.transferable);
    }
    setStage("confirm");
  }

  function backToStage1() {
    setStage("paste");
    setStatus("");
  }

  async function submit() {
    if (!code.trim()) {
      setStatus("⚠️ Please enter the coupon code.");
      return;
    }
    if (!expiryDate) {
      setStatus("⚠️ Please set an expiry date.");
      return;
    }
    if (isReward && !rewardTransferable && !rewardAttestation) {
      setStatus("⚠️ Please confirm you have access to this reward.");
      return;
    }

    setLoading(true);
    try {
      await apiPost("/api/coupons", {
        code,
        brand: detection.brand,
        description: valueDescription,
        category,
        type: couponType,
        expiry: expiryDate,
        restrictions: restrictions || undefined,
        city: city || undefined,
        isReward,
        rewardSource: isReward ? rewardSource : undefined,
        rewardTransferable: isReward ? rewardTransferable : undefined,
        revealMode,
        showDonorName,
      });
      navigate("/browse?donated=true");
    } catch (err) {
      setStatus(`❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  const typeMeta = COUPON_TYPE_COLORS[couponType];
  const gradientClass = CATEGORY_COLORS[category];

  // ─── STAGE 1: PASTE ────────────────────────────
  if (stage === "paste") {
    return (
      <main className="cc-page min-h-screen px-4 py-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.35em] text-white/45 mb-3">Donate a coupon</p>
            <h1 className="text-4xl sm:text-5xl font-semibold text-white mb-3">
              Share your coupon
            </h1>
            <p className="text-lg text-white/65">
              Paste or type the coupon details. We will auto-detect the brand, type, and reward source.
            </p>
          </div>

          {/* Main Card */}
          <div className="cc-panel overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
            <div className="p-8 sm:p-10">
              {/* Input */}
              <label className="block mb-2 text-sm font-semibold text-white/70">
                Paste or type coupon details
              </label>
              <textarea
                value={pasteInput}
                onChange={(e) => handlePasteInput(e.target.value)}
                placeholder="e.g., Swiggy ₹100 off on orders above ₹299
or paste: SWIGGY50
or just: zomato 50% off"
                className="cc-textarea h-28 font-mono"
              />

              {/* Detection Results */}
              {detection.brand && (
                <div className="mt-7 space-y-4 p-5 cc-panel border border-white/10">
                  {/* Brand + Logo */}
                  <div className="flex items-center gap-3">
                    {logo && <img src={logo} alt={detection.brand} className="w-8 h-8 object-contain" />}
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-widest font-bold">Brand detected</p>
                      <p className="text-xl font-semibold text-white">{detection.brand}</p>
                    </div>
                  </div>

                  {/* Category + Type badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="cc-tag">
                      📂 {detection.category}
                    </span>
                    <span className="cc-tag">
                      {typeMeta.emoji} {detection.type}
                    </span>
                  </div>

                  {/* Confidence bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-white/60">Detection confidence</p>
                      <p className="text-xs font-bold text-white/80">{confidencePercent}%</p>
                    </div>
                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/10">
                      <div
                        className={`h-full bg-gradient-to-r ${confidencePercent >= 80 ? "from-green-400 to-emerald-500" : "from-yellow-400 to-orange-500"
                          } transition-all duration-500`}
                        style={{ width: `${confidencePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Reward detection */}
                  {detection.isReward && (
                    <div className="cc-alert">
                      <p className="text-sm font-semibold text-purple-200">
                        💳 This looks like a reward/cashback coupon
                      </p>
                      <p className="text-xs text-purple-200/80 mt-1">
                        Source: {detection.rewardSource || "Unknown"} · {detection.transferable ? "✅ Transferable" : "⚠️ May need your help"}
                      </p>
                    </div>
                  )}

                  {/* Warnings */}
                  {detection.warning && (
                    <div className="cc-alert cc-alert-warning">
                      <p className="text-sm font-semibold">⚠️ {detection.warning}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Status message */}
              {status && (
                <div className="mt-6 cc-alert cc-alert-error">
                  <p className="text-sm font-semibold">{status}</p>
                </div>
              )}

              {/* Next button */}
              <button
                onClick={moveToConfirm}
                disabled={!detection.brand}
                className={`mt-8 w-full py-3.5 px-6 rounded-full text-lg font-semibold transition-all ${detection.brand
                    ? "cc-btn-primary hover:scale-[1.01]"
                    : "cc-btn opacity-40 cursor-not-allowed"
                  }`}
              >
                Next: Confirm Details →
              </button>

              {/* Info footer */}
              <p className="text-xs text-white/45 text-center mt-6">
                💡 Tip: The more details you paste, the better we detect. E.g., "Swiggy ₹100 off on orders above ₹299"
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ─── STAGE 2: CONFIRM ───────────────────────────
  return (
    <main className="cc-page min-h-screen px-4 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <button
            onClick={backToStage1}
            className="text-sm text-white/60 hover:text-white font-semibold mb-4 inline-flex items-center gap-1.5"
          >
            ← Back to paste
          </button>
          <h1 className="text-4xl font-semibold text-white mb-3">
            Almost there
          </h1>
          <p className="text-lg text-white/65">
            Just fill in a few more details.
          </p>
        </div>

        {/* Main Card */}
        <div className="cc-panel overflow-hidden">
          {/* Brand banner */}
          <div className={`h-24 bg-gradient-to-r ${gradientClass} relative flex items-center px-8`}>
            {logo && (
              <img src={logo} alt={detection.brand} className="w-12 h-12 object-contain bg-white rounded-lg p-2" />
            )}
            <div className="ml-4 text-white">
              <p className="text-xs uppercase tracking-widest font-bold opacity-90">brand</p>
              <p className="text-2xl font-extrabold">{detection.brand}</p>
            </div>
          </div>

          <div className="p-8 sm:p-10 space-y-8">
            {/* Section 1: Essential Fields */}
            <div>
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                🔑 Essential Details
              </h2>
              <div className="space-y-5">
                {/* Code */}
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    Coupon Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g., SWIGGY50, SAVE100"
                    className="cc-field font-mono font-semibold"
                  />
                </div>

                {/* Value Description */}
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    What's the offer? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={valueDescription}
                    onChange={(e) => setValueDescription(e.target.value)}
                    placeholder="e.g., 50% off up to ₹100, Free delivery on orders above ₹299"
                    className="cc-field"
                  />
                </div>

                {/* Expiry */}
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    Expires on <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="cc-field"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Coupon Type & Category */}
            <div>
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                🏷️ Coupon Type & Category
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">Type</label>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value as CouponType)}
                    className="cc-select"
                  >
                    {couponTypes.map((t) => (
                      <option key={t} value={t}>
                        {COUPON_TYPE_COLORS[t].emoji} {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CouponCategory)}
                    className="cc-select"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Reward Coupon Detection */}
            {detection.isReward && (
              <div className="cc-panel p-6 border border-purple-500/40 bg-purple-500/10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-bold text-purple-200 flex items-center gap-2">
                    💳 Reward/Cashback Coupon
                  </h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-sm font-semibold text-purple-200">Source</label>
                    <select
                      value={rewardSource}
                      onChange={(e) => setRewardSource(e.target.value as CouponSource)}
                      className="cc-select cc-select-compact"
                    >
                      {rewardSources.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 space-y-4">

                  {/* Transferability */}
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-white/15 bg-black/30">
                    <input
                      type="checkbox"
                      checked={rewardTransferable}
                      onChange={(e) => setRewardTransferable(e.target.checked)}
                      id="transferable"
                      className="w-5 h-5 rounded border-zinc-300 text-purple-600"
                    />
                    <label htmlFor="transferable" className="text-sm font-semibold text-purple-200 cursor-pointer flex-1">
                      ✅ This reward is transferable (recipient can redeem directly)
                    </label>
                  </div>

                  {/* Attestation for non-transferable */}
                  {!rewardTransferable && (
                    <div className="cc-alert cc-alert-warning">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rewardAttestation}
                          onChange={(e) => setRewardAttestation(e.target.checked)}
                          className="w-5 h-5 rounded border-amber-600 text-amber-600"
                        />
                        <span className="text-sm font-semibold text-amber-900">
                          I confirm I have access to this reward and can help the recipient redeem it
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section 4: Optional Details */}
            <details className="group">
              <summary className="cursor-pointer select-none">
                <span className="text-lg font-bold text-white flex items-center gap-2 group-open:text-white/80">
                  ⚙️ Optional Details
                  <span className="text-zinc-400 group-open:rotate-180 transition-transform">▼</span>
                </span>
              </summary>
              <div className="mt-5 space-y-5 p-6 cc-panel">
                {/* Restrictions */}
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    Restrictions or terms
                  </label>
                  <textarea
                    value={restrictions}
                    onChange={(e) => setRestrictions(e.target.value)}
                    placeholder="e.g., Not valid in Delhi, only for first-time users"
                    className="cc-textarea h-20"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    Available in city
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Delhi, Mumbai, Pan-India"
                    className="cc-field"
                  />
                </div>

                {/* Reveal mode */}
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    How should the code be shared?
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-white/15 rounded-xl hover:border-white/40 cursor-pointer transition">
                      <input
                        type="radio"
                        name="reveal"
                        value="donorApproval"
                        checked={revealMode === "donorApproval"}
                        onChange={(e) => setRevealMode(e.target.value as typeof revealMode)}
                        className="w-4 h-4"
                      />
                      <span className="font-semibold text-zinc-900">I approve each request first</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-white/15 rounded-xl hover:border-white/40 cursor-pointer transition">
                      <input
                        type="radio"
                        name="reveal"
                        value="autoRelease"
                        checked={revealMode === "autoRelease"}
                        onChange={(e) => setRevealMode(e.target.value as typeof revealMode)}
                        className="w-4 h-4"
                      />
                      <span className="font-semibold text-zinc-900">Auto-release to anyone who needs it</span>
                    </label>
                  </div>
                </div>

                {/* Show donor name */}
                <label className="flex items-center gap-3 p-3 border border-white/15 rounded-xl hover:border-white/40 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={showDonorName}
                    onChange={(e) => setShowDonorName(e.target.checked)}
                    className="w-5 h-5 rounded border-zinc-300"
                  />
                  <span className="font-semibold text-zinc-900">Show my name to the person who receives it</span>
                </label>
              </div>
            </details>

            {/* Status message */}
            {status && (
              <div className={`cc-alert ${status.includes("❌") ? "cc-alert-error" : "cc-alert-warning"}`}>
                <p className="text-sm font-semibold">{status}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={submit}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:scale-105"
                }`}
            >
              {loading ? "Donating... 🎁" : "Donate This Coupon! 🎁"}
            </button>

            {/* Info footer */}
            <p className="text-xs text-zinc-400 text-center">
              ✨ Your generosity matters. A real person will be grateful.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
