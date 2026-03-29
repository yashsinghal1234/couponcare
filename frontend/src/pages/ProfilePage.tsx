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

export function ProfilePage() {
  const [status, setStatus] = useState("Loading profile...");
  const [me, setMe] = useState<Me["user"] | null>(null);

  useEffect(() => {
    (async () => {
      const r = await apiGet<Me>("/api/auth/me");
      if (!r.ok) return setStatus(r.error);
      setMe(r.data.user);
      setStatus("");
    })();
  }, []);

  if (!me) return <div className="cc-muted">{status}</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="cc-title">Your profile</h1>
        <p className="cc-muted mt-1">Track your contribution and impact on CouponCare.</p>
      </div>

      <div className="cc-card overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1556742208-999815fca738?auto=format&fit=crop&w=1200&q=80"
          alt="Profile banner"
          className="h-44 w-full object-cover"
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

