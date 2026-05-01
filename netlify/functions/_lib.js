import jwt from "jsonwebtoken";

/* ───── cookie helpers ───── */
export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(/;\s*/).forEach((p) => {
    if (!p) return;
    const eq = p.indexOf("=");
    if (eq < 0) return;
    out[p.slice(0, eq).trim()] = decodeURIComponent(p.slice(eq + 1));
  });
  return out;
}

export function cookie(name, value, opts = {}) {
  const parts = [`${name}=${value}`, "Path=/", "HttpOnly", "Secure", "SameSite=Lax"];
  if (opts.maxAge != null) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.expires)        parts.push(`Expires=${opts.expires.toUTCString()}`);
  return parts.join("; ");
}

/* ───── auth ───── */
const SESSION_COOKIE = "auth";
const SESSION_TTL    = 7 * 24 * 60 * 60; // 7 дней

export function signSession(payload) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: SESSION_TTL });
}

export function verifySessionFromRequest(req) {
  const cookies = parseCookies(req.headers.get("cookie") || "");
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function setSessionCookie(token) {
  return cookie(SESSION_COOKIE, token, { maxAge: SESSION_TTL });
}

export function clearSessionCookie() {
  return cookie(SESSION_COOKIE, "", { maxAge: 0 });
}

/* ───── admin allow-list ───── */
export function isAdmin(login) {
  if (!login) return false;
  const list = (process.env.ADMIN_USERS || "")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(String(login).toLowerCase());
}

/* ───── responses ───── */
export const json = (obj, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });

export const redirect = (location, headers = {}) =>
  new Response(null, { status: 302, headers: { Location: location, ...headers } });

export const text = (body, status = 200, headers = {}) =>
  new Response(body, { status, headers: { "Content-Type": "text/plain", ...headers } });
