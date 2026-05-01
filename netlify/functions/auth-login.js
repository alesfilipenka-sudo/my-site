import crypto from "node:crypto";
import { cookie, redirect, text } from "./_lib.js";

/**
 * GET /.netlify/functions/auth-login
 * Стартует GitHub OAuth: ставит CSRF-state в cookie и редиректит на github.com/login/oauth/authorize.
 */
export default async (req) => {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) return text("GITHUB_OAUTH_CLIENT_ID is not configured", 500);

  const url = new URL(req.url);
  const state = crypto.randomBytes(16).toString("hex");

  // куда вернуться после успешного логина
  const returnTo = url.searchParams.get("returnTo") || "/admin";

  const params = new URLSearchParams({
    client_id: clientId,
    scope: "read:user",
    state,
    allow_signup: "false",
    redirect_uri: `${url.origin}/.netlify/functions/auth-callback`,
  });

  const headers = new Headers();
  headers.append("Set-Cookie", cookie("oauth_state", state, { maxAge: 600 }));
  headers.append("Set-Cookie", cookie("oauth_return_to", encodeURIComponent(returnTo), { maxAge: 600 }));
  headers.set("Location", `https://github.com/login/oauth/authorize?${params.toString()}`);

  return new Response(null, { status: 302, headers });
};
