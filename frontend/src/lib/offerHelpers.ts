const brandDomains: Record<string, string> = {
  amazon: "amazon.in",
  flipkart: "flipkart.com",
  swiggy: "swiggy.com",
  zomato: "zomato.com",
  dominos: "dominos.co.in",
  "domino's": "dominos.co.in",
  mcdonalds: "mcdonaldsindia.com",
  "bookmyshow": "bookmyshow.com",
  paytm: "paytm.com",
  googlepay: "pay.google.com",
  gpay: "pay.google.com"
};

const productImages: Record<string, string> = {
  powerbank: "https://images.unsplash.com/photo-1510552776732-01accf0d5f62?auto=format&fit=crop&w=1200&q=80",
  mobile: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
  headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
  grocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
  movie: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
  default: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=80"
};

export function getBrandLogo(brand: string): string | null {
  const key = normalize(brand);
  const domain = brandDomains[key];
  return domain ? `https://logo.clearbit.com/${domain}` : null;
}

export function getOfferImage(brand: string, text: string): string {
  const combined = normalize(`${brand} ${text}`);
  for (const k of Object.keys(productImages)) {
    if (k !== "default" && combined.includes(k)) return productImages[k];
  }
  return productImages.default;
}

export function improveOfferText(input: string): string {
  if (!input.trim()) return "";
  const compact = input.replace(/\s+/g, " ").trim();
  const sentence = compact.charAt(0).toUpperCase() + compact.slice(1);
  return sentence
    .replace(/\brs\.?\s*/gi, "Rs ")
    .replace(/\bmin order\b/gi, "Minimum order")
    .replace(/\bupto\b/gi, "Up to")
    .replace(/\boff\b/gi, "off")
    .replace(/\s+([,.!?])/g, "$1");
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9']/g, "");
}

