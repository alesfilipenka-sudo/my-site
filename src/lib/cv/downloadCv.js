/**
 * Download CV: тянет свежие данные из Supabase и собирает PDF прямо в браузере.
 * @react-pdf/renderer и шаблон грузятся только по клику — основной бандл сайта не растёт.
 */
import { supabase } from "../supabase";

export async function loadCvData() {
  const [contentRes, expRes] = await Promise.all([
    supabase.from("site_content").select("key,data").in("key", ["hero", "cv", "stack", "domains"]),
    supabase.from("experience").select("*")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("id", { ascending: true }),
  ]);
  if (contentRes.error) throw contentRes.error;
  if (expRes.error) throw expRes.error;
  const byKey = Object.fromEntries((contentRes.data || []).map(r => [r.key, r.data]));
  return {
    hero: byKey.hero || {},
    cv: byKey.cv || {},
    stack: byKey.stack || [],
    domains: byKey.domains || [],
    experience: expRes.data || [],
    site: typeof window !== "undefined" ? window.location.origin : "",
  };
}

export function cvFileName(hero) {
  const base = (hero?.name || "CV").trim().replace(/\s+/g, "_").replace(/[^\p{L}\p{N}_-]/gu, "");
  return `${base}_CV.pdf`;
}

export async function downloadCv() {
  const [{ pdf }, { default: CvDocument }, { createElement }, data] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./CvDocument.jsx"),
    import("react"),
    loadCvData(),
  ]);
  const blob = await pdf(createElement(CvDocument, { data })).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = cvFileName(data.hero);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
