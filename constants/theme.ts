/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";
export interface ThemeColors {
  background: string;
  newbackground: string;
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
  destructiveForeground: string;
  destructiveLight?: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  tint: string;
  // Opacity variants
  primary50: string; // 50% opacity
  primary20: string; // 20% opacity
  primary10: string; // 10% opacity
  background80: string; // 80% opacity
  background50: string; // 50% opacity
  foreground80: string; // 80% opacity
  foreground60: string; // 60% opacity
}

export interface Theme {
  light: ThemeColors;
  dark: ThemeColors;
}

export const Colors = {
  light: {
    background: "hsl(30 25% 98%)",
    newbackground: "hsl(36°, 90%, 19%)",
    foreground: "hsl(20 15% 15%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(20 15% 15%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(20 15% 15%)",
    primary: "hsl(15 85% 55%)",
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(200 15% 20%)",
    secondaryForeground: "hsl(0 0% 100%)",
    muted: "hsl(25 10% 92%)",
    mutedForeground: "hsl(20 10% 45%)",
    accent: "hsl(15 60% 95%)",
    accentForeground: "hsl(15 85% 55%)",
    destructive: "#EF4444",
    destructiveForeground: "hsl(0 0% 100%)",
    destructiveLight: "#F87171",
    border: "hsl(25 8% 83%)",
    input: "hsl(30 15% 96%)",
    ring: "hsl(15 85% 55%)",
    chart1: "hsl(15 85% 55%)",
    chart2: "hsl(25 90% 60%)",
    chart3: "hsl(35 85% 50%)",
    chart4: "hsl(5 80% 55%)",
    chart5: "hsl(45 75% 55%)",
    sidebar: "hsl(30 20% 97%)",
    sidebarForeground: "hsl(20 15% 15%)",
    sidebarPrimary: "hsl(15 85% 55%)",
    sidebarPrimaryForeground: "hsl(0 0% 100%)",
    sidebarAccent: "hsl(15 50% 92%)",
    sidebarAccentForeground: "hsl(15 85% 55%)",
    sidebarBorder: "hsl(25 8% 88%)",
    sidebarRing: "hsl(15 85% 55%)",
    tint: "hsl(15 85% 55%)",
    // Opacity variants
    primary50: "rgba(239, 68, 68, 0.5)", // 50% opacity red-orange
    primary20: "rgba(239, 68, 68, 0.2)", // 20% opacity red-orange
    primary10: "rgba(239, 68, 68, 0.1)", // 10% opacity red-orange
    background80: "rgba(255, 248, 240, 0.8)", // 80% opacity warm light background
    background50: "rgba(255, 248, 240, 0.5)", // 50% opacity warm light background
    foreground80: "rgba(31, 41, 55, 0.8)", // 80% opacity dark foreground
    foreground60: "rgba(31, 41, 55, 0.6)", // 60% opacity dark foreground
  },
  dark: {
    background: "hsl(20 15% 8%)",
    newbackground: "hsl(36 19% 90%)",
    foreground: "hsl(25 10% 90%)",
    card: "hsl(20 12% 15%)",
    cardForeground: "hsl(25 8% 85%)",
    popover: "hsl(0 0% 0%)",
    popoverForeground: "hsl(25 10% 90%)",
    primary: "hsl(15 80% 60%)",
    primaryForeground: "hsl(20 15% 8%)",
    secondary: "hsl(25 8% 85%)",
    secondaryForeground: "hsl(20 15% 8%)",
    muted: "hsl(20 10% 20%)",
    mutedForeground: "hsl(25 5% 65%)",
    accent: "hsl(20 12% 12%)",
    accentForeground: "hsl(15 80% 60%)",
    destructive: "#EF4444",
    destructiveForeground: "hsl(0 0% 100%)",
    destructiveLight: "#F87171",
    border: "hsl(20 8% 25%)",
    input: "hsl(20 12% 18%)",
    ring: "hsl(15 80% 60%)",
    chart1: "hsl(15 80% 60%)",
    chart2: "hsl(25 90% 60%)",
    chart3: "hsl(35 85% 50%)",
    chart4: "hsl(5 80% 55%)",
    chart5: "hsl(45 75% 55%)",
    sidebar: "hsl(20 15% 6%)",
    sidebarForeground: "hsl(25 8% 85%)",
    sidebarPrimary: "hsl(15 80% 60%)",
    sidebarPrimaryForeground: "hsl(20 15% 8%)",
    sidebarAccent: "hsl(20 12% 12%)",
    sidebarAccentForeground: "hsl(15 80% 60%)",
    sidebarBorder: "hsl(20 8% 20%)",
    sidebarRing: "hsl(15 80% 60%)",
    tint: "hsl(15 80% 60%)",
    // Opacity variants
    primary50: "rgba(249, 115, 22, 0.5)", // 50% opacity orange
    primary20: "rgba(249, 115, 22, 0.2)", // 20% opacity orange
    primary10: "rgba(249, 115, 22, 0.1)", // 10% opacity orange
    background80: "rgba(15, 23, 42, 0.8)", // 80% opacity dark background
    background50: "rgba(15, 23, 42, 0.5)", // 50% opacity dark background
    foreground80: "rgba(203, 213, 225, 0.8)", // 80% opacity light foreground
    foreground60: "rgba(203, 213, 225, 0.6)", // 60% opacity light foreground
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
    default: "Be Vietnam Pro",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/**
 * Utility function to apply opacity to any color
 * @param color - HSL or hex color string
 * @param opacity - Opacity value between 0 and 1
 * @returns RGBA color string with applied opacity
 */
export const withOpacity = (color: string, opacity: number): string => {
  // If already an rgba color, modify the opacity
  if (color.startsWith("rgba(")) {
    const rgbaMatch = color.match(
      /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/
    );
    if (rgbaMatch) {
      return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${opacity})`;
    }
  }

  // If HSL color, convert to RGB then apply opacity
  if (color.startsWith("hsl(")) {
    const hslMatch = color.match(
      /hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/
    );
    if (hslMatch) {
      const h = parseFloat(hslMatch[1]);
      const s = parseFloat(hslMatch[2]) / 100;
      const l = parseFloat(hslMatch[3]) / 100;

      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l - c / 2;

      let r = 0,
        g = 0,
        b = 0;

      if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
      } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
      } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
      } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
      } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
      } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
      }

      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);

      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }

  // If hex color, convert to RGB then apply opacity
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Fallback: return original color if format not recognized
  return color;
};
