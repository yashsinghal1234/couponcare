import { Link } from "react-router-dom";

export function HomePage() {
  const couponTypes = [
    { icon: "🎟️", title: "Promo Codes", desc: "Regular discount codes from brands", example: "SWIGGY50, ZOMATO40" },
    { icon: "💰", title: "Cashback Rewards", desc: "Reward coupons from credit cards & UPI apps", example: "HDFC Hupi, Paytm rewards" },
    { icon: "🎁", title: "Gift Vouchers", desc: "Prepaid vouchers & Amazon/Flipkart credits", example: "Amazon gift cards, brand vouchers" },
    { icon: "🍔", title: "BOGO Offers", desc: "Buy one get one or combo deals", example: "Domino's BOGO, free items" },
    { icon: "📦", title: "Free Shipping", desc: "Shipping discounts on purchases", example: "Amazon free shipping, flat ₹50 off" },
    { icon: "⏰", title: "Time-Limited", desc: "Super urgent offers expiring today/tomorrow", example: "Flash sales, hourly deals" },
  ];

  const rewardBrands = [
    { brand: "HDFC Hupi", color: "#003498", desc: "Credit card rewards" },
    { brand: "Paytm", color: "#002970", desc: "Payment app cashback" },
    { brand: "Google Pay", color: "#4F8FCE", desc: "UPI rewards" },
    { brand: "PhonePe", color: "#5A189A", desc: "Digital rewards" },
    { brand: "CRED", color: "#000000", desc: "Credit card points" },
    { brand: "Lenskart", color: "#005EB8", desc: "Brand loyalty rewards" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="cc-card grid overflow-hidden md:grid-cols-2">
        <div className="p-6 md:p-10">
          <p className="mb-2 text-orange-400">Donate. Claim. Help.</p>
          <h1 className="cc-title max-w-2xl">Unused coupons can become someone's next meal.</h1>
          <p className="cc-muted mt-3 max-w-2xl">
            CouponCare turns expiring discounts into real support for people who need them most. From promo codes to reward coupons — every discount matters.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link className="cc-btn-primary" to="/donate">
              Donate coupon
            </Link>
            <Link className="cc-btn" to="/browse">
              Browse coupons
            </Link>
            <Link className="cc-btn" to="/signin">
              Sign in
            </Link>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=1200&q=80"
          alt="Food and groceries"
          className="h-64 w-full object-cover md:h-full"
        />
      </section>

      {/* Coupon Types Showcase */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Every coupon helps</h2>
          <p className="cc-muted mt-1">Share what you won't use — promo codes, rewards, gift cards, and more</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {couponTypes.map((type, i) => (
            <div key={i} className="cc-card p-4 hover:border-brand-400 transition-colors">
              <div className="text-2xl mb-2">{type.icon}</div>
              <h3 className="font-semibold text-white">{type.title}</h3>
              <p className="cc-muted text-sm mt-1">{type.desc}</p>
              <p className="text-xs text-brand-400 mt-2 font-mono">e.g., {type.example}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reward Coupons Spotlight */}
      <section className="cc-card p-6 border border-violet-500/30 bg-violet-600/10 space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white">💎 Reward & Cashback Coupons</h2>
          <p className="cc-muted mt-1">Have credit card rewards, HDFC Hupi codes, Paytm cashback, or brand loyalty rewards? They're valuable too!</p>
        </div>
        <div className="text-sm cc-muted space-y-1">
          <p>✓ <strong>HDFC Hupi rewards</strong> — From credit card spends</p>
          <p>✓ <strong>Paytm & UPI cashback</strong> — From payment app usage</p>
          <p>✓ <strong>Brand loyalty rewards</strong> — Lenskart, Myntra, Amazon, Flipkart gift cards</p>
          <p>✓ <strong>Credit card points</strong> — From CRED, banks, and card issuing companies</p>
        </div>
        <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2">
          {rewardBrands.map((rb, i) => (
            <span key={i} className="text-xs px-3 py-1 rounded-full bg-black/40 border border-violet-500/50 text-violet-200">
              {rb.brand}
            </span>
          ))}
        </div>
        <div className="bg-violet-900/40 border border-violet-600/50 rounded p-3 text-xs text-violet-100">
          <strong>Pro tip:</strong> When you donate a reward coupon, just mark it as such. We'll ask if it's transferable and help recipients understand any account-binding limitations.
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-4 md:grid-cols-2">
        <article className="cc-card overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80"
            alt="Coupons and offers"
            className="h-44 w-full object-cover"
          />
          <div className="p-5">
            <h3 className="text-lg font-semibold">Expiry-first matching</h3>
            <p className="cc-muted mt-2">Coupons closest to expiry are surfaced first to minimize waste.</p>
          </div>
        </article>
        <article className="cc-card overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=80"
            alt="Community support"
            className="h-44 w-full object-cover"
          />
          <div className="p-5">
            <h3 className="text-lg font-semibold">Trust-first reveal</h3>
            <p className="cc-muted mt-2">Choose donor approval or auto-release per coupon listing.</p>
          </div>
        </article>
      </section>

      {/* How It Works */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="cc-card p-5">
          <div className="text-orange-400">01</div>
          <h3 className="mt-2 text-lg font-semibold">Donate</h3>
          <p className="cc-muted mt-2">Post brand, value, expiry. Mark if it's a reward coupon.</p>
        </div>
        <div className="cc-card p-5">
          <div className="text-orange-400">02</div>
          <h3 className="mt-2 text-lg font-semibold">Request</h3>
          <p className="cc-muted mt-2">Recipients request what they need, sorted by expiry urgency.</p>
        </div>
        <div className="cc-card p-5">
          <div className="text-orange-400">03</div>
          <h3 className="mt-2 text-lg font-semibold">Reveal</h3>
          <p className="cc-muted mt-2">Auto-release or donor approval. Trust builds the platform.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cc-card bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">Have a coupon collecting dust?</h2>
        <p className="cc-muted">Whether it's a promo code, credit card reward, or brand voucher — donate it in 30 seconds.</p>
        <Link className="cc-btn-primary inline-block" to="/donate">
          Start donating →
        </Link>
      </section>
    </div>
  );
}
