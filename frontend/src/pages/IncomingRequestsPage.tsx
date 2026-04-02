import { useEffect, useState } from "react";

import { apiGet, apiPost } from "../lib/api";

type CouponSummary = {
  id: string;
  brand: string;
  valueDescription: string;
  category: string;
  expiryDate: string;
  brandLogoUrl?: string | null;
  productImageUrl?: string | null;
};

type RecipientSummary = {
  id: string;
  displayName: string;
};

type IncomingRequest = {
  id: string;
  couponId: string;
  recipientId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  coupon?: CouponSummary | null;
  recipient?: RecipientSummary | null;
};

export function IncomingRequestsPage() {
  const [items, setItems] = useState<IncomingRequest[]>([]);
  const [status, setStatus] = useState("");

  async function load() {
    setStatus("Loading...");
    const r = await apiGet<{ requests: IncomingRequest[] }>("/api/requests/incoming");
    if (!r.ok) return setStatus(r.error);
    setItems(r.data.requests);
    setStatus(`Loaded ${r.data.requests.length}`);
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

  const pending = items.filter((r) => r.status === "pending");
  const approved = items.filter((r) => r.status === "approved");

  const statusStyles: Record<IncomingRequest["status"], string> = {
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
          <h2 className="text-lg font-semibold text-white">Pending</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-white/50">
            {pending.length} waiting
          </span>
        </div>
        <div className="grid gap-4">
          {pending.map((r) => {
            const couponImage = r.coupon?.productImageUrl ?? r.coupon?.brandLogoUrl ?? "";
            const couponBrand = r.coupon?.brand ?? "Coupon";
            const couponValue = r.coupon?.valueDescription ?? "Details unavailable";
            const recipientName = r.recipient?.displayName ?? "Recipient";
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
            <h2 className="text-lg font-semibold text-white">Approved</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">
              {approved.length} approved
            </span>
          </div>
          <div className="grid gap-4">
            {approved.map((r) => {
              const couponImage = r.coupon?.productImageUrl ?? r.coupon?.brandLogoUrl ?? "";
              const couponBrand = r.coupon?.brand ?? "Coupon";
              const couponValue = r.coupon?.valueDescription ?? "Details unavailable";
              const recipientName = r.recipient?.displayName ?? "Recipient";
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
    </div>
  );
}

