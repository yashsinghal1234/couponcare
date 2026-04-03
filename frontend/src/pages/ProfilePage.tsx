import { useEffect, useState } from "react";

import { apiGet } from "../lib/api";

type Me = {
  user: {
    displayName: string;
    email: string;
    roles: { donor: boolean; recipient: boolean };
    stats: { donatedCount: number; receivedCount: number; impactScore: number };
  };
};

const AVATAR_STORAGE_KEY = "cc_avatar_url";
const AVATAR_PRESETS = [
  {
    label: "Classic",
    url: "https://i.pinimg.com/736x/b0/bc/be/b0bcbe2b26065f336f6086b4bcd6bea9.jpg",
  },
  {
    label: "Contour",
    url: "https://i.pinimg.com/1200x/82/ff/66/82ff66a7efd8ed5e8969ab6634ba8d85.jpg",
  },
  {
    label: "Studio",
    url: "https://i.pinimg.com/736x/69/59/b8/6959b8d40c99398615fc2d9bb116bdae.jpg",
  },
  {
    label: "Focus",
    url: "https://i.pinimg.com/736x/96/7d/e9/967de98b98584d52f26f88c78cdb6369.jpg",
  },
  {
    label: "Noir",
    url:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' fill='%230b0b0d'/><circle cx='60' cy='60' r='28' fill='%23f8fafc'/></svg>",
  },
  {
    label: "Split",
    url:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%230b0b0d'/><stop offset='100%' stop-color='%23f8fafc'/></linearGradient></defs><rect width='120' height='120' fill='url(%23g)'/></svg>",
  },
  {
    label: "Halo",
    url:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' fill='%230b0b0d'/><circle cx='60' cy='60' r='30' fill='none' stroke='%23f8fafc' stroke-width='6'/></svg>",
  },
  {
    label: "Stripe",
    url:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' fill='%230b0b0d'/><rect x='0' y='52' width='120' height='16' fill='%23f8fafc' opacity='0.9'/></svg>",
  },
];

export function ProfilePage() {
  const [status, setStatus] = useState("Loading profile...");
  const [me, setMe] = useState<Me["user"] | null>(null);
  const [avatar, setAvatar] = useState<string>(() => {
    const stored = localStorage.getItem(AVATAR_STORAGE_KEY);
    return stored || AVATAR_PRESETS[0].url;
  });

  useEffect(() => {
    (async () => {
      const r = await apiGet<Me>("/api/auth/me");
      if (!r.ok) return setStatus(r.error);
      setMe(r.data.user);
      setStatus("");
    })();
  }, []);

  if (!me) return <div className="cc-muted">{status}</div>;

  const selectAvatar = (url: string) => {
    setAvatar(url);
    localStorage.setItem(AVATAR_STORAGE_KEY, url);
    window.dispatchEvent(new Event("cc-avatar-updated"));
  };

  return (
    <div className="cc-page space-y-4">
      <div>
        <h1 className="cc-title">Your profile</h1>
        <p className="cc-muted mt-1">Track your contribution and impact on CouponCare.</p>
      </div>

      <div className="cc-card overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1556742208-999815fca738?auto=format&fit=crop&w=1200&q=80"
          alt="Profile banner"
          className="cc-media h-44 w-full object-cover"
        />
        <div className="p-5">
          <div className="text-xl font-semibold">{me.displayName}</div>
          <div className="cc-muted">{me.email}</div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-white/15 px-2 py-1">Donor: {String(me.roles.donor)}</span>
            <span className="rounded-full border border-white/15 px-2 py-1">Recipient: {String(me.roles.recipient)}</span>
          </div>
        </div>
      </div>

      <div className="cc-panel p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Profile image</div>
            <div className="cc-muted text-xs">Choose from the preset gallery.</div>
          </div>
          <div className="cc-avatar-preview" style={{ backgroundImage: `url(${avatar})` }} />
        </div>
        <div className="cc-avatar-grid mt-4">
          {AVATAR_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={`cc-avatar-option ${avatar === preset.url ? "cc-avatar-option--active" : ""}`}
              onClick={() => selectAvatar(preset.url)}
            >
              <span className="cc-avatar-thumb" style={{ backgroundImage: `url(${preset.url})` }} />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="cc-card p-4">
          <div className="cc-muted">Coupons donated</div>
          <div className="mt-1 text-2xl font-semibold">{me.stats.donatedCount}</div>
        </div>
        <div className="cc-card p-4">
          <div className="cc-muted">Coupons received</div>
          <div className="mt-1 text-2xl font-semibold">{me.stats.receivedCount}</div>
        </div>
        <div className="cc-card p-4">
          <div className="cc-muted">Impact score</div>
          <div className="mt-1 text-2xl font-semibold">{me.stats.impactScore}</div>
        </div>
      </div>
    </div>
  );
}

