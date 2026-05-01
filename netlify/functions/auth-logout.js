import { clearSessionCookie } from "./_lib.js";

/**
 * POST /.netlify/functions/auth-logout
 * Очищает cookie с JWT.
 */
export default async () => {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.append("Set-Cookie", clearSessionCookie());
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
