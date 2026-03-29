import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiGet, apiPost } from "../lib/api";

type IncomingRequest = {
  id: string;
  couponId: string;
  recipientId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export function IncomingRequestsPage() {
  const navigate = useNavigate();
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
    const res = await apiGet<{ requests: IncomingRequest[] }>("/api/requests/incoming");
    if (!res.ok) return setStatus(res.error);
    setItems(res.data.requests);
    const nextPending = res.data.requests.find((x) => x.status === "pending");
    if (!nextPending) navigate("/profile");
  }

  async function reject(id: string) {
    setStatus("Rejecting...");
    const r = await apiPost(`/api/requests/${id}/reject`);
    if (!r.ok) return setStatus(r.error);
    const res = await apiGet<{ requests: IncomingRequest[] }>("/api/requests/incoming");
    if (!res.ok) return setStatus(res.error);
    setItems(res.data.requests);
    const nextPending = res.data.requests.find((x) => x.status === "pending");
    if (!nextPending) navigate("/profile");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="cc-title">Incoming requests</h1>
        <p className="cc-muted mt-1">Review and approve/reject recipient requests.</p>
      </div>
      {status ? <div className="cc-muted">{status}</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((r) => (
          <article key={r.id} className="cc-card overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd59a93b6f0f?auto=format&fit=crop&w=1200&q=80"
              alt="Incoming request"
              className="h-32 w-full object-cover"
            />
            <div className="space-y-3 p-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/25 text-sm font-semibold text-orange-300">
                  {r.recipientId.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-medium">Request {r.id.slice(-6)}</div>
                  <div className="text-white/65">
                    Coupon: {r.couponId.slice(-8)} • {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <span
                className={`inline-flex rounded-full border px-2 py-1 text-xs ${
                  r.status === "approved"
                    ? "border-green-500/40 bg-green-500/10 text-green-300"
                    : r.status === "rejected"
                      ? "border-red-500/40 bg-red-500/10 text-red-300"
                      : "border-orange-500/40 bg-orange-500/10 text-orange-300"
                }`}
              >
                {r.status}
              </span>

              <div className="flex gap-2">
                <button
                  className="cc-btn disabled:opacity-50"
                  disabled={r.status !== "pending"}
                  onClick={() => approve(r.id)}
                  type="button"
                >
                  Approve
                </button>
                <button
                  className="cc-btn disabled:opacity-50"
                  disabled={r.status !== "pending"}
                  onClick={() => reject(r.id)}
                  type="button"
                >
                  Reject
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!items.length ? <div className="cc-card p-3 text-sm text-white/65">No incoming requests.</div> : null}
    </div>
  );
}

