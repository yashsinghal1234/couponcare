import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="space-y-6">
      <section className="cc-card grid overflow-hidden md:grid-cols-2">
        <div className="p-6 md:p-10">
          <p className="mb-2 text-orange-400">Donate. Claim. Help.</p>
          <h1 className="cc-title max-w-2xl">Unused coupons can become someone’s next meal.</h1>
          <p className="cc-muted mt-3 max-w-2xl">
            CouponCare turns expiring discounts into real support for people who need them most. Start with the MVP loop: donate, browse, request, reveal.
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

      <section className="grid gap-4 md:grid-cols-3">
        <div className="cc-card p-5">
          <div className="text-orange-400">01</div>
          <h3 className="mt-2 text-lg font-semibold">Donate</h3>
          <p className="cc-muted mt-2">Post brand, value, expiry and choose reveal mode.</p>
        </div>
        <div className="cc-card p-5">
          <div className="text-orange-400">02</div>
          <h3 className="mt-2 text-lg font-semibold">Request</h3>
          <p className="cc-muted mt-2">Recipients request what they actually need, sorted by expiry.</p>
        </div>
        <div className="cc-card p-5">
          <div className="text-orange-400">03</div>
          <h3 className="mt-2 text-lg font-semibold">Reveal</h3>
          <p className="cc-muted mt-2">Auto-release or donor approval prevents waste and builds trust.</p>
        </div>
      </section>
    </div>
  );
}

