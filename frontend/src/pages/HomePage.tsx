import { Link } from "react-router-dom";

export function HomePage() {
  const heroImage = (import.meta.env.VITE_HERO_IMAGE as string | undefined) ??
    "https://i.pinimg.com/1200x/39/2c/f4/392cf408ba0887f854a028a252428fcb.jpg";
  const brandRow = ["Swiggy", "Zomato", "Amazon", "Lenskart", "Myntra", "Paytm", "BookMyShow", "Blinkit"];

  return (
    <div className="cc-hero-page">
      <div className="cc-hero-wrap">
        <section className="cc-hero" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="cc-hero-copy">
            <div className="cc-hero-text">
              <p className="cc-hero-kicker">CouponCare community</p>
              <h1 className="cc-hero-title">Bringing people together in a disconnected world</h1>
              <p className="cc-hero-subtitle">
                Bridging the gap between unused coupons and real needs, where trusted giving becomes effortless and immediate.
              </p>
            </div>
          </div>
          <div className="cc-hero-art" aria-hidden="true" />
          <Link className="cc-cta cc-hero-cta" to="/donate">
            Join the community
          </Link>
        </section>
      </div>

      <section className="cc-brand-row">
        {brandRow.map((brand) => (
          <span key={brand} className="cc-brand-chip">
            {brand}
          </span>
        ))}
      </section>
    </div>
  );
}
