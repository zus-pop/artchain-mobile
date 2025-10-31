// tokens.ts
export const MobilePalette = {
  brand: "#DC5A54",
  brandDark: "#B54540",
  brandLight: "#F2A5A1",
  onBrand: "#FFFFFF",

  light: {
    background: "#FCFCFC",
    card: "#FFFFFF",
    border: "rgba(0,0,0,0.08)",
    fg: "#111827",
    muted: "#6B7280",
    innerStroke: "rgba(255,255,255,0.65)",
  },
  dark: {
    background: "#0B0F14",
    card: "#0F141A",
    border: "rgba(255,255,255,0.12)",
    fg: "#E5E7EB",
    muted: "#94A3B8",
    innerStroke: "rgba(255,255,255,0.28)",
  },

  status: {
    ACTIVE: { bg: "#DC5A54", on: "#FFFFFF" },
    UPCOMING: { bg: "#D97706", on: "#FFFFFF" },
    COMPLETED: { bg: "#16A34A", on: "#FFFFFF" },
    ENDED: { bg: "#64748B", on: "#FFFFFF" },
    DRAFT: { bg: "#94A3B8", on: "#0B1220" },
  },

  timeChipBg: "#111827",
  coverOverlay: "rgba(0,0,0,0.12)",
} as const;
