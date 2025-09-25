/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

export const Colors = {
  light: {
    tint: "hsl(18.0952 25.5061% 51.5686%)",
    background: "hsl(55.0000 30.0000% 92.1569%)",
    foreground: "hsl(15.6522 15.4362% 29.2157%)",
    card: "hsl(55.0000 30.0000% 92.1569%)",
    cardForeground: "hsl(15.6522 15.4362% 29.2157%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(15.6522 15.4362% 29.2157%)",
    primary: "hsl(18.0952 25.5061% 51.5686%)",
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(37.5000 22.4719% 65.0980%)",
    secondaryForeground: "hsl(0 0% 100%)",
    muted: "hsl(20.4545 44.8980% 80.7843%)",
    mutedForeground: "hsl(13.7500 21.0526% 44.7059%)",
    accent: "hsl(20.4545 44.8980% 80.7843%)",
    accentForeground: "hsl(15.6522 15.4362% 29.2157%)",
    destructive: "hsl(22.5000 14.8148% 10.5882%)",
    destructiveForeground: "hsl(0 0% 100%)",
    border: "hsl(37.5000 22.4719% 65.0980%)",
    input: "hsl(37.5000 22.4719% 65.0980%)",
    ring: "hsl(18.0952 25.5061% 51.5686%)",
    chart1: "hsl(18.0952 25.5061% 51.5686%)",
    chart2: "hsl(13.7500 21.0526% 44.7059%)",
    chart3: "hsl(22.3729 32.9609% 64.9020%)",
    chart4: "hsl(37.5000 22.4719% 65.0980%)",
    chart5: "hsl(22.3256 18.7773% 55.0980%)",
    sidebar: "hsl(20.6250 44.4444% 85.8824%)",
    sidebarForeground: "hsl(15.6522 15.4362% 29.2157%)",
    sidebarPrimary: "hsl(18.0952 25.5061% 51.5686%)",
    sidebarPrimaryForeground: "hsl(0 0% 100%)",
    sidebarAccent: "hsl(22.3729 32.9609% 64.9020%)",
    sidebarAccentForeground: "hsl(0 0% 100%)",
    sidebarBorder: "hsl(22.3256 18.7773% 55.0980%)",
    sidebarRing: "hsl(18.0952 25.5061% 51.5686%)",
    text: "hsl(15.6522 15.4362% 29.2157%)",
    icon: "hsl(18.0952 25.5061% 51.5686%)",
    tabIconDefault: "hsl(18.0952 25.5061% 51.5686%)",
    tabIconSelected: "hsl(18.0952 25.5061% 51.5686%)",
    shadow:
      "2px 2px 0px 0px hsl(20 18% 51% / 0.11), 2px 1px 2px -1px hsl(20 18% 51% / 0.11)",
    cardAlt: "hsl(0 0% 100%)",
    cardBorder: "hsl(37.5000 22.4719% 65.0980%)",
    heroOverlay: "rgba(44,44,74,0.18)",
  },
  dark: {
    tint: "hsl(22.3729 32.9609% 64.9020%)",
    background: "hsl(20 15.3846% 15.2941%)",
    foreground: "hsl(55.0000 30.0000% 92.1569%)",
    card: "hsl(21.4286 13.2075% 20.7843%)",
    cardForeground: "hsl(55.0000 30.0000% 92.1569%)",
    popover: "hsl(21.4286 13.2075% 20.7843%)",
    popoverForeground: "hsl(55.0000 30.0000% 92.1569%)",
    primary: "hsl(22.3729 32.9609% 64.9020%)",
    primaryForeground: "hsl(20 15.3846% 15.2941%)",
    secondary: "hsl(13.7500 21.0526% 44.7059%)",
    secondaryForeground: "hsl(55.0000 30.0000% 92.1569%)",
    muted: "hsl(15.6522 15.4362% 29.2157%)",
    mutedForeground: "hsl(21.4286 26.5823% 69.0196%)",
    accent: "hsl(37.5000 22.4719% 65.0980%)",
    accentForeground: "hsl(20 15.3846% 15.2941%)",
    destructive: "hsl(0 68.6747% 67.4510%)",
    destructiveForeground: "hsl(20 15.3846% 15.2941%)",
    border: "hsl(15.6522 15.4362% 29.2157%)",
    input: "hsl(15.6522 15.4362% 29.2157%)",
    ring: "hsl(22.3729 32.9609% 64.9020%)",
    chart1: "hsl(22.3729 32.9609% 64.9020%)",
    chart2: "hsl(37.5000 22.4719% 65.0980%)",
    chart3: "hsl(18.0952 25.5061% 51.5686%)",
    chart4: "hsl(13.7500 21.0526% 44.7059%)",
    chart5: "hsl(22.3256 18.7773% 55.0980%)",
    sidebar: "hsl(22.5000 14.8148% 10.5882%)",
    sidebarForeground: "hsl(55.0000 30.0000% 92.1569%)",
    sidebarPrimary: "hsl(22.3729 32.9609% 64.9020%)",
    sidebarPrimaryForeground: "hsl(22.5000 14.8148% 10.5882%)",
    sidebarAccent: "hsl(37.5000 22.4719% 65.0980%)",
    sidebarAccentForeground: "hsl(22.5000 14.8148% 10.5882%)",
    sidebarBorder: "hsl(15.6522 15.4362% 29.2157%)",
    sidebarRing: "hsl(22.3729 32.9609% 64.9020%)",
    text: "hsl(55.0000 30.0000% 92.1569%)",
    icon: "hsl(22.3729 32.9609% 64.9020%)",
    tabIconDefault: "hsl(22.3729 32.9609% 64.9020%)",
    tabIconSelected: "hsl(22.3729 32.9609% 64.9020%)",
    shadow:
      "2px 2px 0px 0px hsl(20 18% 30% / 0.11), 2px 1px 2px -1px hsl(20 18% 30% / 0.11)",
    cardAlt: "hsl(21.4286 13.2075% 20.7843%)",
    cardBorder: "hsl(15.6522 15.4362% 29.2157%)",
    heroOverlay: "rgba(44,44,74,0.48)",
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
