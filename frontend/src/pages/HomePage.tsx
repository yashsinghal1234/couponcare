import { Link } from "react-router-dom";

export function HomePage() {
  const heroImage = (import.meta.env.VITE_HERO_IMAGE as string | undefined) ??
    "https://i.pinimg.com/1200x/39/2c/f4/392cf408ba0887f854a028a252428fcb.jpg";
  const brandLogos = [
    { name: "Swiggy", logo: "https://cdn.simpleicons.org/swiggy/ffffff" },
    { name: "Zomato", logo: "https://cdn.simpleicons.org/zomato/ffffff" },
    { name: "Amazon", logo: "https://cdn.simpleicons.org/amazon/ffffff" },
    { name: "Flipkart", logo: "https://cdn.simpleicons.org/flipkart/ffffff" },
    { name: "Myntra", logo: "https://cdn.simpleicons.org/myntra/ffffff" },
    { name: "Lenskart", logo: "https://cdn.simpleicons.org/lenskart/ffffff" },
    { name: "Paytm", logo: "https://cdn.simpleicons.org/paytm/ffffff" },
    { name: "PhonePe", logo: "https://cdn.simpleicons.org/phonepe/ffffff" },
    { name: "BookMyShow", logo: "https://cdn.simpleicons.org/bookmyshow/ffffff" },
    { name: "Blinkit", logo: "https://cdn.simpleicons.org/blinkit/ffffff" },
  ];

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

      <div className="cc-hero-spacer" aria-hidden="true" />

      <section className="cc-strip-section" aria-label="Brand partners">
        <div className="cc-strip">
          <div className="cc-strip-track">
            {[...brandLogos, ...brandLogos].map((brand, index) => (
              <div className="cc-strip-item" key={`${brand.name}-${index}`}>
                <img src={brand.logo} alt={brand.name} className="cc-strip-logo" />
                <span>{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
