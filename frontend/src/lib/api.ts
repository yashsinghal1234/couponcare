const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";
const AUTH_EVENT = "cc-auth-changed";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function getToken(): string | null {
  return localStorage.getItem("cc_token");
}

export function setToken(token: string | null) {
  if (!token) localStorage.removeItem("cc_token");
  else localStorage.setItem("cc_token", token);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearToken() {
  setToken(null);
}

export function onAuthChanged(listener: () => void) {
  window.addEventListener(AUTH_EVENT, listener);
  return () => window.removeEventListener(AUTH_EVENT, listener);
}

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
      mode: "cors",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    const json = await safeJson(res);
    if (!res.ok) return { ok: false, error: json?.error ?? `HTTP ${res.status}` };
    return { ok: true, data: json as T };
  } catch (e) {
    return { ok: false, error: `Network error (API unreachable). ${String(e)}` };
  }
}

export async function apiPost<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body === undefined ? "{}" : JSON.stringify(body)
    });
    const json = await safeJson(res);
    if (!res.ok) return { ok: false, error: json?.error ?? `HTTP ${res.status}` };
    return { ok: true, data: json as T };
  } catch (e) {
    return { ok: false, error: `Network error (API unreachable). ${String(e)}` };
  }
}

async function safeJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

