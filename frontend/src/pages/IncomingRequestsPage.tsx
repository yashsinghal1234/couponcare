import { useEffect, useState } from "react";

import { apiGet, apiPost } from "../lib/api";

type CouponSummary = {
  id: string;
  brand: string;
  valueDescription: string;
  category: string;
  expiryDate: string;
  showDonorName?: boolean;
  revealMode?: string;
  restrictions?: string;
  city?: string;
  code?: string;
  brandLogoUrl?: string | null;
  productImageUrl?: string | null;
};

type RecipientSummary = {
  id: string;
  displayName: string;
};

type RequestItem = {
  id: string;
  couponId: string;
  recipientId: string;
  donorId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  recipientName?: string | null;
  donorName?: string | null;
  coupon?: CouponSummary | null;
  recipient?: RecipientSummary | null;
  donor?: { id: string; displayName: string } | null;
};

export function IncomingRequestsPage() {
  const [incomingItems, setIncomingItems] = useState<RequestItem[]>([]);
  const [outgoingItems, setOutgoingItems] = useState<RequestItem[]>([]);
  const [incomingError, setIncomingError] = useState("");
  const [outgoingError, setOutgoingError] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    setStatus("Loading...");
    setIncomingError("");
    setOutgoingError("");
    const [incomingRes, outgoingRes] = await Promise.all([
      apiGet<{ requests: RequestItem[] }>("/api/requests/incoming"),
      apiGet<{ requests: RequestItem[] }>("/api/requests/outgoing")
    ]);

    if (!incomingRes.ok) {
      setIncomingError(incomingRes.error);
      setIncomingItems([]);
    } else {
      setIncomingItems(incomingRes.data.requests);
    }

    if (!outgoingRes.ok) {
      setOutgoingError(outgoingRes.error);
      setOutgoingItems([]);
    } else {
      setOutgoingItems(outgoingRes.data.requests);
    }

    setStatus("Updated");
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: string) {
    setStatus("Approving...");
    const r = await apiPost(`/api/requests/${id}/approve`);
    if (!r.ok) return setStatus(r.error);
    await load();
  }

  async function reject(id: string) {
    setStatus("Rejecting...");
    const r = await apiPost(`/api/requests/${id}/reject`);
    if (!r.ok) return setStatus(r.error);
    await load();
  }

  const pending = incomingItems.filter((r) => r.status === "pending");
  const approved = incomingItems.filter((r) => r.status === "approved");

  const statusStyles: Record<RequestItem["status"], string> = {
    pending: "border-orange-500/40 bg-orange-500/10 text-orange-300",
    approved: "border-green-500/40 bg-green-500/10 text-green-300",
    rejected: "border-red-500/40 bg-red-500/10 text-red-300"
  };

  const formatDateTime = (value: string) => new Date(value).toLocaleString();
  const formatDate = (value: string) => new Date(value).toLocaleDateString();

  return (
    <div className="cc-page space-y-6">
      <div>
        <h1 className="cc-title">Incoming requests</h1>
        <p className="cc-muted mt-1">Approve or reject coupon requests from recipients.</p>
      </div>
      {status ? <div className="cc-muted">{status}</div> : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">Incoming approvals</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-white/50">
            {pending.length} waiting
          </span>
        </div>
        {incomingError ? <div className="cc-alert cc-alert-error">{incomingError}</div> : null}
        <div className="grid gap-4">
          {pending.map((r) => {
            const couponImage = r.coupon?.productImageUrl ?? r.coupon?.brandLogoUrl ?? "";
            const couponBrand = r.coupon?.brand ?? "Coupon";
            const couponValue = r.coupon?.valueDescription ?? "Details unavailable";
            const recipientName = r.recipient?.displayName ?? r.recipientName ?? "Recipient";
            const category = r.coupon?.category;
            const expiryDate = r.coupon?.expiryDate;

            return (
              <article key={r.id} className="cc-card overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-40 w-full md:h-auto md:w-48">
                    {couponImage ? (
                      <img
                        src={couponImage}
                        alt={`${couponBrand} coupon`}
                        className="cc-media h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/15 via-white/5 to-black text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                        {couponBrand}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-white/45">Requester</div>
                        <div className="text-lg font-semibold text-white">{recipientName}</div>
                      </div>
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs ${statusStyles[r.status]}`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="grid gap-1 text-sm">
                      <div className="font-medium text-white">{couponBrand}</div>
                      <div className="text-white/65">{couponValue}</div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {category ? <span className="cc-tag">{category}</span> : null}
                      {expiryDate ? (
                        <span className="cc-tag">Expires {formatDate(expiryDate)}</span>
                      ) : null}
                      <span className="cc-tag">Requested {formatDateTime(r.createdAt)}</span>
                    </div>

                    <div className="flex gap-2">
                      <button className="cc-btn" onClick={() => approve(r.id)} type="button">
                        Approve
                      </button>
                      <button className="cc-btn" onClick={() => reject(r.id)} type="button">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!pending.length ? (
          <div className="cc-card p-3 text-sm text-white/65">No pending requests.</div>
        ) : null}
      </section>

      {approved.length ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-white">Approved incoming</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">
              {approved.length} approved
            </span>
          </div>
          <div className="grid gap-4">
            {approved.map((r) => {
              const couponImage = r.coupon?.productImageUrl ?? r.coupon?.brandLogoUrl ?? "";
              const couponBrand = r.coupon?.brand ?? "Coupon";
              const couponValue = r.coupon?.valueDescription ?? "Details unavailable";
              const recipientName = r.recipient?.displayName ?? r.recipientName ?? "Recipient";
              const category = r.coupon?.category;
              const expiryDate = r.coupon?.expiryDate;

              return (
                <article key={r.id} className="cc-card overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative h-40 w-full md:h-auto md:w-48">
                      {couponImage ? (
                        <img
                          src={couponImage}
                          alt={`${couponBrand} coupon`}
                          className="cc-media h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/15 via-white/5 to-black text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                          {couponBrand}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-3 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-white/45">Recipient</div>
                          <div className="text-lg font-semibold text-white">{recipientName}</div>
                        </div>
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs ${statusStyles[r.status]}`}
                        >
                          {r.status}
                        </span>
                      </div>

                      <div className="grid gap-1 text-sm">
                        <div className="font-medium text-white">{couponBrand}</div>
                        <div className="text-white/65">{couponValue}</div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        {category ? <span className="cc-tag">{category}</span> : null}
                        {expiryDate ? (
                          <span className="cc-tag">Expires {formatDate(expiryDate)}</span>
                        ) : null}
                        <span className="cc-tag">Requested {formatDateTime(r.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">Your requests</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-white/50">
            {outgoingItems.length} total
          </span>
        </div>
        {outgoingError ? <div className="cc-alert cc-alert-error">{outgoingError}</div> : null}
        <div className="grid gap-4 md:grid-cols-2">
          {outgoingItems.map((r) => {
            const couponImage = r.coupon?.productImageUrl ?? r.coupon?.brandLogoUrl ?? "";
            const couponBrand = r.coupon?.brand ?? "Coupon";
            const couponValue = r.coupon?.valueDescription ?? "Details unavailable";
            const donorName = r.donorName ?? r.donor?.displayName ?? "Anonymous donor";
            const category = r.coupon?.category;
            const expiryDate = r.coupon?.expiryDate;
            const couponCode = r.coupon?.code;
            const restrictions = r.coupon?.restrictions;
            const city = r.coupon?.city;
            const revealMode = r.coupon?.revealMode;

            return (
              <article key={r.id} className="cc-card overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-32 w-full md:h-auto md:w-36">
                    {couponImage ? (
                      <img
                        src={couponImage}
                        alt={`${couponBrand} coupon`}
                        className="cc-media h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/15 via-white/5 to-black text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                        {couponBrand}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-white/45">Requested from</div>
                        <div className="text-base font-semibold text-white">{donorName}</div>
                      </div>
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs ${statusStyles[r.status]}`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="grid gap-1 text-sm">
                      <div className="font-medium text-white">{couponBrand}</div>
                      <div className="text-white/65">{couponValue}</div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {category ? <span className="cc-tag">{category}</span> : null}
                      {expiryDate ? (
                        <span className="cc-tag">Expires {formatDate(expiryDate)}</span>
                      ) : null}
                      {city ? <span className="cc-tag">{city}</span> : null}
                      {revealMode ? <span className="cc-tag">{revealMode}</span> : null}
                      <span className="cc-tag">Requested {formatDateTime(r.createdAt)}</span>
                    </div>

                    {r.status === "approved" && couponCode ? (
                      <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm">
                        <div className="text-xs uppercase tracking-[0.2em] text-white/50">Coupon code</div>
                        <div className="mt-1 font-mono text-base text-white/90">{couponCode}</div>
                      </div>
                    ) : null}

                    {restrictions ? (
                      <div className="text-xs text-white/60">Restrictions: {restrictions}</div>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!outgoingItems.length ? (
          <div className="cc-card p-3 text-sm text-white/65">No requests yet.</div>
        ) : null}
      </section>
    </div>
  );
}

