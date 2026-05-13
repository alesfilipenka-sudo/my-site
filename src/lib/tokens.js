export const ACCENT = { hex: "#6366F1", glow: "99,102,241" }; // Electric Indigo

/**
 * Возвращает токены дизайн-системы под выбранную тему.
 * Используется Site.jsx, ProjectsPage.jsx и любыми shared-компонентами.
 */
export function tokens(dark) {
  if (dark) return {
    bg: "#0A0A0B", bg2: "#0F0F11",
    surface: "rgba(255,255,255,0.02)", surfaceHi: "rgba(255,255,255,0.04)",
    glass: "rgba(10,10,11,0.55)",
    text: "#EDEDF0", textSec: "#8B8B95", textTer: "#52525B",
    border: "rgba(255,255,255,0.06)", borderMd: "rgba(255,255,255,0.10)", borderHi: "rgba(255,255,255,0.16)",
    grid: "rgba(255,255,255,0.025)",
    acc: ACCENT.hex, accGlow: ACCENT.glow, ok: "#84D2A8",
  };
  return {
    bg: "#F7F7F5", bg2: "#FCFCFA",
    surface: "rgba(0,0,0,0.015)", surfaceHi: "rgba(0,0,0,0.03)",
    glass: "rgba(247,247,245,0.65)",
    text: "#0A0A0B", textSec: "#52525B", textTer: "#A1A1AA",
    border: "rgba(0,0,0,0.06)", borderMd: "rgba(0,0,0,0.10)", borderHi: "rgba(0,0,0,0.18)",
    grid: "rgba(0,0,0,0.03)",
    acc: ACCENT.hex, accGlow: ACCENT.glow, ok: "#1D9E75",
  };
}
