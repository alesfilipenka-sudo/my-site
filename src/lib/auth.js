import { useEffect, useState } from "react";
import { supabase } from "./supabase";

/**
 * Нормализует Supabase user в форму, которую ждёт UI:
 *   { login, email, name, avatar, role }
 *
 * Allowlist:
 *   VITE_ADMIN_EMAILS — comma-separated emails (от Supabase)
 *   VITE_ADMIN_USERS  — comma-separated GitHub usernames (из user_metadata.user_name)
 *
 * Если ни email, ни username не в списке — role = "user", и ProtectedRoute не пустит на /admin.
 */
function normalizeUser(supaUser) {
  if (!supaUser) return null;
  const meta  = supaUser.user_metadata || {};
  const email = (supaUser.email || "").toLowerCase();
  const login = (meta.user_name || meta.preferred_username || email.split("@")[0] || "").toLowerCase();

  const parseList = (v) => (v || "")
    .toLowerCase()
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const adminEmails = parseList(import.meta.env.VITE_ADMIN_EMAILS);
  const adminLogins = parseList(import.meta.env.VITE_ADMIN_USERS);

  // если allow-list вообще не настроен — никого не пускаем (безопасный дефолт)
  const hasList = adminEmails.length || adminLogins.length;
  const isAdmin = hasList && (adminEmails.includes(email) || adminLogins.includes(login));

  return {
    login,
    email,
    name: meta.full_name || meta.name || login,
    avatar: meta.avatar_url || null,
    role: isAdmin ? "admin" : "user",
  };
}

/** React-хук с текущей Supabase-сессией. Подписан на onAuthStateChange. */
export function useAuth() {
  const [state, setState] = useState({ loading: true, user: null });

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState({ loading: false, user: normalizeUser(data?.session?.user) });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState({ loading: false, user: normalizeUser(session?.user) });
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  return state;
}

/** Старт OAuth: редирект на GitHub, после возврата Supabase сам подцепит сессию. */
export async function login(returnTo = "/admin") {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: window.location.origin + returnTo },
  });
  if (error) {
    console.error("login error:", error);
    alert("Login failed: " + error.message);
  }
}

/** Logout + редирект на главную. */
export async function logout() {
  await supabase.auth.signOut();
  window.location.assign("/");
}
