// artist-theme-react-native.tsx
// Drop-in primitives that translate your global CSS/Tailwind setup into React Native.
// Works with Expo or vanilla RN. Keep everything colocated for easy copy/paste.

import React, { PropsWithChildren, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ViewStyle,
  TextStyle,
  ColorValue,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Tuple type required by expo-linear-gradient: at least 2 ColorValues
export type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];

// -----------------------------------------------------------------------------
// THEME TOKENS (variables you had in :root / .dark)
// -----------------------------------------------------------------------------
export type Theme = {
  radius: number;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    border: string;
    input: string;
    ring: string;

    // charts
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    chart5: string;

    // sidebar
    sidebar: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
    sidebarRing: string;
  };
};

export const lightTheme: Theme = {
  radius: 10,
  colors: {
    background: "#f7f7f7",
    foreground: "#1f1f1f",
    card: "#ffffff",
    cardForeground: "#1f1f1f",
    popover: "#ffffff",
    popoverForeground: "#1f1f1f",
    primary: "#d9534f",
    primaryForeground: "#ffffff",
    secondary: "#333333",
    secondaryForeground: "#ffffff",
    muted: "#eaeaea",
    mutedForeground: "#777777",
    accent: "#ffe5e5",
    accentForeground: "#d9534f",
    destructive: "#d9534f",
    border: "#e6e2da",
    input: "#f2f2f2",
    ring: "#d9534f",

    chart1: "#6a7cff",
    chart2: "#54c5d0",
    chart3: "#4c6ef5",
    chart4: "#a6e35f",
    chart5: "#b6db5b",

    sidebar: "#fafafa",
    sidebarForeground: "#403e47",
    sidebarPrimary: "#222222",
    sidebarPrimaryForeground: "#fafafa",
    sidebarAccent: "#f4f4f7",
    sidebarAccentForeground: "#222222",
    sidebarBorder: "#e5e7eb",
    sidebarRing: "#3b82f6",
  },
};

export const darkTheme: Theme = {
  radius: 10,
  colors: {
    background: "#252525",
    foreground: "#fafafa",
    card: "#343434",
    cardForeground: "#fafafa",
    popover: "#343434",
    popoverForeground: "#fafafa",
    primary: "#ff946e",
    primaryForeground: "#1f1f1f",
    secondary: "#444444",
    secondaryForeground: "#fafafa",
    muted: "#3a3a3a",
    mutedForeground: "#b5b5b5",
    accent: "#3a3a3a",
    accentForeground: "#ff946e",
    destructive: "#ff946e",
    border: "rgba(255,255,255,0.1)",
    input: "rgba(255,255,255,0.15)",
    ring: "#ff946e",

    chart1: "#7aa2ff",
    chart2: "#78e0a2",
    chart3: "#b9c1ff",
    chart4: "#c68cff",
    chart5: "#f2b46e",

    sidebar: "#343434",
    sidebarForeground: "#fafafa",
    sidebarPrimary: "#ff946e",
    sidebarPrimaryForeground: "#fafafa",
    sidebarAccent: "#3a3a3a",
    sidebarAccentForeground: "#fafafa",
    sidebarBorder: "rgba(255,255,255,0.1)",
    sidebarRing: "#ffb48a",
  },
};

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------
const shadow = (elevation = 4) => ({
  shadowColor: "#000",
  shadowOffset: { width: 0, height: Math.round(elevation / 2) },
  shadowOpacity: 0.15,
  shadowRadius: Math.round(elevation),
  elevation,
});

// -----------------------------------------------------------------------------
// STYLE FACTORY (maps your CSS utilities into RN StyleSheet objects)
// -----------------------------------------------------------------------------
export const createStyles = (t: Theme) =>
  StyleSheet.create({
    // base
    screen: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    text: {
      color: t.colors.foreground,
    },

    // product-card
    productCard: {
      backgroundColor: t.colors.card,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: 12,
      ...shadow(8),
    },

    // btn-primary
    btnPrimary: {
      backgroundColor: t.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    btnPrimaryText: {
      color: t.colors.primaryForeground,
      fontWeight: "600",
    },

    // staff-card & variants
    staffCard: {
      borderWidth: 2,
      borderColor: "#e6e2da",
      backgroundColor: "#ffffff",
      ...shadow(6),
    },

    staffStatPrimary: {
      borderWidth: 2,
      borderColor: "#fecaca", // red-100
      backgroundColor: "#fff1f2", // red-50
    },
    staffStatPrimaryIcon: {
      borderRadius: 999,
      padding: 12,
      ...shadow(6),
      // gradient provided via <LinearGradient>
    },

    staffStatSecondary: {
      borderWidth: 2,
      borderColor: "#ffedd5",
      backgroundColor: "#fff7ed",
    },
    staffStatSuccess: {
      borderWidth: 2,
      borderColor: "#dcfce7",
      backgroundColor: "#f0fdf4",
    },
    staffStatInfo: {
      borderWidth: 2,
      borderColor: "#dbeafe",
      backgroundColor: "#eff6ff",
    },

    // outline button
    staffBtnOutline: {
      borderWidth: 2,
      borderColor: "#e6e2da",
      backgroundColor: "#ffffff",
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    staffBtnOutlineText: {
      color: "#333333",
      fontWeight: "600",
    },

    // input
    staffInput: {
      borderWidth: 2,
      borderColor: "#e6e2da",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },

    // badges
    badge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#ffffff",
    },

    // headings
    staffHeading: {
      fontSize: 20,
      fontWeight: "800",
      // text gradient is implemented with <TextGradient>
    },

    divider: {
      borderTopWidth: 2,
      borderTopColor: "#e6e2da",
      marginVertical: 16,
    },
  });

// -----------------------------------------------------------------------------
// COMPONENTS
// -----------------------------------------------------------------------------

// 1) ArtistHero — gradient background + dark overlay
export const ArtistHero: React.FC<
  PropsWithChildren<{ height?: number; overlayOpacity?: number }>
> = ({ children, height = 220, overlayOpacity = 0.4 }) => {
  return (
    <View style={{ height, position: "relative", overflow: "hidden" }}>
      <LinearGradient
        // Matches your CSS multi-stop gradient
        colors={[$1] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: `rgba(0,0,0,${overlayOpacity})` },
        ]}
      />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {children}
      </View>
    </View>
  );
};

// 2) ProductCard — card container
export const ProductCard: React.FC<
  PropsWithChildren<{ theme?: Theme; style?: ViewStyle }>
> = ({ children, theme = lightTheme, style }) => {
  const s = useMemo(() => createStyles(theme), [theme]);
  return <View style={[s.productCard, style]}>{children}</View>;
};

// 3) PrimaryButton — matches .btn-primary
export const PrimaryButton: React.FC<
  PropsWithChildren<{
    theme?: Theme;
    onPress?: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
  }>
> = ({ children, theme = lightTheme, onPress, style, textStyle }) => {
  const s = useMemo(() => createStyles(theme), [theme]);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.btnPrimary,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
        style,
      ]}
    >
      <Text style={[s.btnPrimaryText, textStyle]}>{children}</Text>
    </Pressable>
  );
};

// 4) StaffStatCard — primary/secondary/success/info variants
export const StaffStatCard: React.FC<
  PropsWithChildren<{
    variant?: "primary" | "secondary" | "success" | "info";
    style?: ViewStyle;
  }>
> = ({ children, variant = "primary", style }) => {
  const variantStyle: ViewStyle =
    variant === "secondary"
      ? styles.staffStatSecondary
      : variant === "success"
      ? styles.staffStatSuccess
      : variant === "info"
      ? styles.staffStatInfo
      : styles.staffStatPrimary;

  return <View style={[styles.staffCard, variantStyle, style]}>{children}</View>;
};

// 5) Badge — colored gradient shortcuts (pending/active/approved/rejected/neutral)
export const Badge: React.FC<
  PropsWithChildren<{
    colors: GradientColors; // [from, to]
    text?: string;
    style?: ViewStyle;
  }>
> = ({ children, colors, text, style }) => {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.badge, style]}>
      <Text style={styles.badgeText}>{text ?? children}</Text>
    </LinearGradient>
  );
};

// 6) Input — styled input matching .staff-input
export const StaffInput = React.forwardRef<TextInput, { style?: TextStyle }>(
  ({ style, ...props }, ref) => {
    return <TextInput ref={ref} placeholderTextColor="#888" style={[styles.staffInput as TextStyle, style]} {...props} />;
  }
);

// 7) Decorative header with a left gradient bar (instead of ::before)
export const SectionHeader: React.FC<PropsWithChildren<{ title: string }>> = ({ title, children }) => {
  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <LinearGradient colors={["#d9534f", "#f97316"] as const} style={{ width: 4, height: 32, borderRadius: 8 }} />
        <Text style={styles.staffHeading}>{title}</Text>
      </View>
      {children}
    </View>
  );
};

// 8) Tiny utilities you can reuse where Tailwind classes were used
export const clamp2Props = { numberOfLines: 2 } as const; // use on <Text>

// Pre-made badge color sets from your CSS
export const BADGE = {
  pending: ["#fb923c", "#f59e0b"],
  active: ["#22c55e", "#10b981"],
  approved: ["#34d399", "#22c55e"],
  rejected: ["#f87171", "#ef4444"],
  neutral: ["#9ca3af", "#6b7280"],
} as const satisfies Record<string, GradientColors>;

// Re-export base styles so you can mix and match
const styles = createStyles(lightTheme);
export { styles };

// -----------------------------------------------------------------------------
// USAGE EXAMPLE (remove before production if you want)
// -----------------------------------------------------------------------------
/*
import { lightTheme, darkTheme, createStyles, ArtistHero, ProductCard, PrimaryButton, StaffStatCard, StaffInput, SectionHeader, BADGE, Badge, clamp2Props } from "./artist-theme-react-native";

const s = createStyles(lightTheme);

<ArtistHero>
  <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800" }}>Artist Store</Text>
</ArtistHero>

<ProductCard style={{ padding: 16 }}>
  <Text style={[s.text, clamp2Props]}>Awesome handmade craft</Text>
  <PrimaryButton onPress={() => {}}>Buy now</PrimaryButton>
</ProductCard>

<StaffStatCard variant="primary" style={{ padding: 16 }}>
  <LinearGradient colors={["#d9534f", "#e67e73"]} start={{x:0,y:0}} end={{x:1,y:1}} style={s.staffStatPrimaryIcon}>
    <Text style={{ color: "#fff", fontWeight: "700" }}>★</Text>
  </LinearGradient>
  <Text>Primary stat</Text>
</StaffStatCard>

<Badge colors={BADGE.active}>ACTIVE</Badge>
<StaffInput placeholder="Your name" />
<SectionHeader title="Overview" />
*/
