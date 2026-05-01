import { useEffect, useState, useCallback } from "react";

const ME_URL     = "/.netlify/functions/auth-me";
const LOGIN_URL  = "/.netlify/functions/auth-login";
const LOGOUT_URL = "/.netlify/functions/auth-logout";

/** Хук получения текущего пользователя из cookie-сессии. */
export function useAuth() {
  const [state, setState] = useState({ loading: true, user: null });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(ME_URL, { credentials: "include", cache: "no-store" });
      if (!res.ok) {
        setState({ loading: false, user: null });
        return;
      }
      const data = await res.json();
      setState({ loading: false, user: data.user || null });
    } catch {
      setState({ loading: false, user: null });
    }
  }, []);

  // refresh() читает cookie через сеть; setState внутри происходит ПОСЛЕ await — не sync.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refresh(); }, [refresh]);

  return { ...state, refresh };
}

export function login(returnTo = "/admin") {
  const url = `${LOGIN_URL}?returnTo=${encodeURIComponent(returnTo)}`;
  window.location.assign(url);
}

export async function logout() {
  await fetch(LOGOUT_URL, { method: "POST", credentials: "include" });
  window.location.assign("/");
}
