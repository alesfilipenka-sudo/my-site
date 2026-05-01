import {
  cookie, parseCookies, signSession, setSessionCookie,
  isAdmin, text,
} from "./_lib.js";

/**
 * GET /.netlify/functions/auth-callback?code=...&state=...
 * Обмен code → access_token → проверка username в ADMIN_USERS → выпуск JWT в HttpOnly cookie.
 */
export default async (req) => {
  const url = new URL(req.url);
  const code  = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookies = parseCookies(req.headers.get("cookie") || "");
  if (!code || !state || !cookies.oauth_state || cookies.oauth_state !== state) {
    return text("Invalid OAuth state", 400);
  }

  const clientId     = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return text("OAuth app is not configured", 500);

  // 1. code → access_token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${url.origin}/.netlify/functions/auth-callback`,
    }),
  });
  if (!tokenRes.ok) return text("Token exchange failed", 502);
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return text("OAuth: no access_token in response", 401);

  // 2. user info
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/json",
      "User-Agent": "alesfilipenka-admin",
    },
  });
  if (!userRes.ok) return text("Failed to fetch user", 502);
  const user = await userRes.json();

  // 3. allow-list
  if (!isAdmin(user.login)) {
    return text(`Sorry, ${user.login} is not authorised for this admin.`, 403);
  }

  // 4. подписать JWT и поставить cookie
  const jwtToken = signSession({
    sub: user.login,
    name: user.name || user.login,
    avatar: user.avatar_url,
    role: "admin",
  });

  const returnTo = decodeURIComponent(cookies.oauth_return_to || "/admin");

  const headers = new Headers();
  headers.set("Location", returnTo.startsWith("/") ? returnTo : "/admin");
  headers.append("Set-Cookie", setSessionCookie(jwtToken));
  // зачистить служебные cookie
  headers.append("Set-Cookie", cookie("oauth_state",     "", { maxAge: 0 }));
  headers.append("Set-Cookie", cookie("oauth_return_to", "", { maxAge: 0 }));

  return new Response(null, { status: 302, headers });
};
