import { useEffect, useState } from "react";

/**
 * Глобальная тема (dark/light) с persist в localStorage и
 * подпиской через module-scoped pub/sub. Все компоненты, использующие
 * useTheme(), синхронизированы в реальном времени без Context.
 *
 * Приоритет источников:
 *   1. localStorage["theme"]  (если выставлено user'ом — победит даже над системной темой)
 *   2. prefers-color-scheme  (если в localStorage ничего нет)
 */

const STORAGE_KEY = "theme";
const listeners = new Set();

function readInitial() {
  if (typeof window === "undefined") return false;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark")  return true;
    if (saved === "light") return false;
  } catch { /* ignore */ }
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

let current = readInitial();

export function useTheme() {
  const [dark, setLocal] = useState(current);

  useEffect(() => {
    listeners.add(setLocal);
    // на случай, если другой компонент обновил тему между нашим первым render-ом и подпиской.
    // setState здесь происходит не во время рендера, а как реакция на изменение module state — это безопасно.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (dark !== current) setLocal(current);
    return () => listeners.delete(setLocal);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setDark = (next) => {
    current = typeof next === "function" ? Boolean(next(current)) : Boolean(next);
    try { localStorage.setItem(STORAGE_KEY, current ? "dark" : "light"); } catch { /* quota / private mode */ }
    listeners.forEach((fn) => fn(current));
  };

  return [dark, setDark];
}
