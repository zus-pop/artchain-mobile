/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";
export interface ThemeColors {
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
  destructiveForeground: string;
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
    background: "hsl(0 0% 98.8235%)",
    foreground: "hsl(210 25% 7.8431%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(210 25% 7.8431%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(210 25% 7.8431%)",
    primary: "hsl(203.8863 88.2845% 53.1373%)",
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(208.2353 23.9437% 13.9216%)",
    secondaryForeground: "hsl(0 0% 100%)",
    muted: "hsl(240 1.9608% 90%)",
    mutedForeground: "hsl(210 25% 7.8431%)",
    accent: "hsl(201.4286 30.4348% 90.9804%)",
    accentForeground: "hsl(203.8863 88.2845% 53.1373%)",
    destructive: "hsl(356.3033 90.5579% 54.3137%)",
    destructiveForeground: "hsl(0 0% 100%)",
    border: "hsl(201.4286 30.4348% 90.9804%)",
    input: "hsl(200 23.0769% 97.4510%)",
    ring: "hsl(202.8169 89.1213% 53.1373%)",
    chart1: "hsl(203.8863 88.2845% 53.1373%)",
    chart2: "hsl(159.7826 100% 36.0784%)",
    chart3: "hsl(42.0290 92.8251% 56.2745%)",
    chart4: "hsl(147.1429 78.5047% 41.9608%)",
    chart5: "hsl(341.4894 75.2000% 50.9804%)",
    sidebar: "hsl(180 6.6667% 97.0588%)",
    sidebarForeground: "hsl(210 25% 7.8431%)",
    sidebarPrimary: "hsl(203.8863 88.2845% 53.1373%)",
    sidebarPrimaryForeground: "hsl(0 0% 100%)",
    sidebarAccent: "hsl(211.5789 51.3514% 92.7451%)",
    sidebarAccentForeground: "hsl(203.8863 88.2845% 53.1373%)",
    sidebarBorder: "hsl(205.0000 25.0000% 90.5882%)",
    sidebarRing: "hsl(202.8169 89.1213% 53.1373%)",
    tint: "hsl(203.8863 88.2845% 53.1373%)",
    // Opacity variants
    primary50: "rgba(59, 130, 246, 0.5)", // 50% opacity blue
    primary20: "rgba(59, 130, 246, 0.2)", // 20% opacity blue
    primary10: "rgba(59, 130, 246, 0.1)", // 10% opacity blue
    background80: "rgba(248, 250, 252, 0.8)", // 80% opacity light background
    background50: "rgba(248, 250, 252, 0.5)", // 50% opacity light background
    foreground80: "rgba(23, 37, 84, 0.8)", // 80% opacity dark foreground
    foreground60: "rgba(23, 37, 84, 0.6)", // 60% opacity dark foreground
  },
  dark: {
    background: "hsl(196.3636 21.5686% 10%)",
    foreground: "hsl(200 6.6667% 91.1765%)",
    card: "hsl(197.1429 13.7255% 20%)",
    cardForeground: "hsl(0 0% 85.0980%)",
    popover: "hsl(0 0% 0%)",
    popoverForeground: "hsl(200 6.6667% 91.1765%)",
    primary: "hsl(203.7736 87.6033% 52.5490%)",
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(192.0000 100.0000% 99.0196%)",
    secondaryForeground: "hsl(210 25% 7.8431%)",
    muted: "hsl(198.2609 100.0000% 18.0392%)",
    mutedForeground: "hsl(205.7143 4.1420% 66.8627%)",
    accent: "hsl(205.7143 70% 7.8431%)",
    accentForeground: "hsl(203.7736 87.6033% 52.5490%)",
    destructive: "hsl(356.3033 90.5579% 54.3137%)",
    destructiveForeground: "hsl(0 0% 100%)",
    border: "hsl(210.0000 12.6582% 30.9804%)",
    input: "hsl(207.6923 27.6596% 18.4314%)",
    ring: "hsl(202.8169 89.1213% 53.1373%)",
    chart1: "hsl(203.8863 88.2845% 53.1373%)",
    chart2: "hsl(159.7826 100% 36.0784%)",
    chart3: "hsl(42.0290 92.8251% 56.2745%)",
    chart4: "hsl(147.1429 78.5047% 41.9608%)",
    chart5: "hsl(341.4894 75.2000% 50.9804%)",
    sidebar: "hsl(228 9.8039% 10%)",
    sidebarForeground: "hsl(0 0% 85.0980%)",
    sidebarPrimary: "hsl(202.8169 89.1213% 53.1373%)",
    sidebarPrimaryForeground: "hsl(0 0% 100%)",
    sidebarAccent: "hsl(205.7143 70% 7.8431%)",
    sidebarAccentForeground: "hsl(203.7736 87.6033% 52.5490%)",
    sidebarBorder: "hsl(205.7143 15.7895% 26.0784%)",
    sidebarRing: "hsl(202.8169 89.1213% 53.1373%)",
    tint: "hsl(203.7736 87.6033% 52.5490%)",
    // Opacity variants
    primary50: "rgba(56, 189, 248, 0.5)", // 50% opacity blue
    primary20: "rgba(56, 189, 248, 0.2)", // 20% opacity blue
    primary10: "rgba(56, 189, 248, 0.1)", // 10% opacity blue
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
