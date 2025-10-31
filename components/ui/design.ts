// ui/design.ts
import { Platform } from "react-native";

/* ---------- Color tokens (light/dark) ---------- */
export const palette = {
  light: {
    bg: "#0B1220", // dùng header gradient, phần list đặt surface riêng
    surface: "#FFFFFF",
    surfaceAlt: "#F7F8FA",
    text: "#0F172A",
    textMuted: "#64748B",
    border: "#E5E7EB",
    primary: "#2563EB",
    primaryFg: "#FFFFFF",
    accent: "#8B5CF6",
    accentFg: "#FFFFFF",
  },
  dark: {
    bg: "#06080F",
    surface: "#0B1220",
    surfaceAlt: "#0E1526",
    text: "#E5E7EB",
    textMuted: "#94A3B8",
    border: "#1F2937",
    primary: "#60A5FA",
    primaryFg: "#0B1220",
    accent: "#A78BFA",
    accentFg: "#0B1220",
  },
} as const;

/* ---------- Gradients (nhẹ, có kiểm soát) ---------- */
export const gradients = {
  brand: (scheme: "light" | "dark") =>
    scheme === "dark" ? ["#0EA5E9", "#6366F1"] : ["#60A5FA", "#8B5CF6"],
  softBlue: ["#60A5FA", "#3B82F6"],
  softIndigo: ["#A78BFA", "#8B5CF6"],
} as const;

/* ---------- Radius, spacing, elevation ---------- */
export const radius = { sm: 8, md: 12, lg: 16, xl: 20 } as const;
export const spacing = { xs: 6, sm: 10, md: 14, lg: 18, xl: 22 } as const;

export const elevation = Platform.select({
  ios: {
    card: {
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    flat: {
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
    },
  },
  android: {
    card: { elevation: 2 },
    flat: { elevation: 0 },
  },
});

/* ---------- Typography ---------- */
export const type = {
  title: { fontSize: 16.5, fontWeight: "800", letterSpacing: 0.2 },
  body: { fontSize: 13.5, lineHeight: 19 },
  meta: { fontSize: 12, fontWeight: "700", letterSpacing: 0.2 },
} as const;
