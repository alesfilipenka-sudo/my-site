import { verifySessionFromRequest, json, text } from "./_lib.js";

/**
 * POST /.netlify/functions/save-content
 * Body: { content: <object> }
 * Защищённый proxy для коммита content.json в GitHub.
 *
 * Безопасность:
 *  - проверяет JWT в HttpOnly cookie (роль "admin")
 *  - GITHUB_REPO_TOKEN живёт ТОЛЬКО на сервере, в bundle не попадает
 *  - коммит подписан логином пользователя из JWT
 */
export default async (req) => {
  if (req.method !== "POST") return text("Method not allowed", 405);

  const session = verifySessionFromRequest(req);
  if (!session)                  return text("Unauthorized", 401);
  if (session.role !== "admin")  return text("Forbidden", 403);

  let body;
  try { body = await req.json(); }
  catch { return text("Bad JSON", 400); }

  const content = body?.content;
  if (!content || typeof content !== "object") return text("Missing content payload", 400);

  // лёгкая валидация структуры — чтобы случайным запросом не сломать сайт
  const requiredKeys = ["hero", "stats", "expertise", "cases", "experience", "stack", "domains"];
  for (const k of requiredKeys) {
    if (!(k in content)) return text(`Invalid content: missing "${k}"`, 400);
  }

  const owner = process.env.GITHUB_REPO_OWNER || "alesfilipenka-sudo";
  const repo  = process.env.GITHUB_REPO_NAME  || "my-site";
  const path  = process.env.GITHUB_REPO_PATH  || "public/content.json";
  const token = process.env.GITHUB_REPO_TOKEN;
  if (!token) return text("GITHUB_REPO_TOKEN is not configured", 500);

  // 1. получить SHA текущего файла
  const ghHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "alesfilipenka-admin",
  };
  const getRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=main`,
    { headers: ghHeaders }
  );
  if (!getRes.ok) return text(`GitHub GET failed: ${getRes.status}`, 502);
  const fileData = await getRes.json();

  // 2. PUT новый контент
  const json2 = JSON.stringify(content, null, 2);
  const contentBase64 = Buffer.from(json2, "utf-8").toString("base64");

  const putRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: { ...ghHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `admin: content update by @${session.sub} ${new Date().toISOString()}`,
        content: contentBase64,
        sha: fileData.sha,
        branch: "main",
      }),
    }
  );
  if (!putRes.ok) {
    const errBody = await putRes.text().catch(() => "");
    return text(`GitHub PUT failed: ${putRes.status} ${errBody}`, 502);
  }
  const putData = await putRes.json();

  return json({ ok: true, commit: putData?.commit?.sha?.slice(0, 7) || null });
};
