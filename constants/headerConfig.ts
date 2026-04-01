/**
 * headerConfig.ts - Unified Header Configuration & Constants
 * Ensures consistent header styling across iOS and Android
 */

import { Platform } from "react-native";

// ============= Header Heights =============
export const HEADER_HEIGHT = 56; // Material Design standard + safe room
export const HEADER_WITH_SAFE_AREA_IOS = 56 + 12; // iOS padding
export const HEADER_WITH_SAFE_AREA_ANDROID = 56 + 8; // Android padding

// ============= Header Spacing =============
export const HEADER_PADDING_HORIZONTAL = 12;
export const HEADER_PADDING_VERTICAL = 8;
export const HEADER_ELEMENT_GAP = 8;

// ============= Back Button Specs =============
export const BACK_BUTTON_SIZE = Platform.OS === "ios" ? 36 : 48;
export const BACK_BUTTON_ICON_SIZE = Platform.OS === "ios" ? 20 : 24;

// ============= Title Specs =============
export const TITLE_FONT_SIZE = 18;
export const TITLE_FONT_WEIGHT = Platform.OS === "ios" ? "600" : "500";
export const TITLE_TEXT_ALIGN = Platform.OS === "ios" ? "center" : "left";

// ============= Right Action Specs =============
export const RIGHT_ACTION_SIZE = Platform.OS === "ios" ? 36 : 48;
export const RIGHT_ACTION_ICON_SIZE = Platform.OS === "ios" ? 20 : 24;

// ============= Header Variants =============
export enum HeaderVariant {
  DEFAULT = "default",
  TRANSLUCENT = "translucent",
  SOLID = "solid",
}

// ============= Type Definitions =============
export interface HeaderConfig {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  rightActions?: {
    icon: string;
    onPress: () => void;
    testID?: string;
  }[];
  variant?: HeaderVariant;
  backgroundColor?: string;
  borderBottom?: boolean;
  translucent?: boolean;
}

// ============= Platform-Specific Constants =============
export const PLATFORM_HEADER_CONFIG = Platform.select({
  ios: {
    SAFE_AREA_PADDING: 12,
    TITLE_ALIGN: "center",
    BACK_ICON: "chevron-back",
    ANIMATION_DURATION: 200,
    SCALE_FACTOR: 1.06,
    SPRING_CONFIG: { damping: 16, stiffness: 220, mass: 0.35 },
  },
  android: {
    SAFE_AREA_PADDING: 8,
    TITLE_ALIGN: "left",
    BACK_ICON: "arrow-back",
    ANIMATION_DURATION: 220,
    SCALE_FACTOR: 1.12,
    SPRING_CONFIG: { damping: 14, stiffness: 180, mass: 0.4 },
  },
  default: {
    SAFE_AREA_PADDING: 8,
    TITLE_ALIGN: "center",
    BACK_ICON: "chevron-back",
    ANIMATION_DURATION: 200,
    SCALE_FACTOR: 1.06,
    SPRING_CONFIG: { damping: 16, stiffness: 220, mass: 0.35 },
  },
}) as {
  SAFE_AREA_PADDING: number;
  TITLE_ALIGN: "center" | "left";
  BACK_ICON: string;
  ANIMATION_DURATION: number;
  SCALE_FACTOR: number;
  SPRING_CONFIG: { damping: number; stiffness: number; mass: number };
};

// ============= Tab Bar Configuration =============
export const TAB_BAR_HEIGHT = 60;
export const TAB_ICON_SIZE = 24;
export const TAB_LABEL_FONT_SIZE = 11;
export const TAB_LABEL_FONT_WEIGHT = "700";

export const PLATFORM_TAB_CONFIG = Platform.select({
  ios: {
    ACTIVE_SCALE: 1.06,
    ACTIVE_OPACITY: 1,
    INACTIVE_OPACITY: 0.85,
    ANIMATION_DURATION: 200,
    SPRING_CONFIG: { damping: 16, stiffness: 220, mass: 0.35 },
    ICON_HIGHLIGHT: false,
  },
  android: {
    ACTIVE_SCALE: 1.12,
    ACTIVE_OPACITY: 1,
    INACTIVE_OPACITY: 0.75,
    ANIMATION_DURATION: 220,
    SPRING_CONFIG: { damping: 14, stiffness: 180, mass: 0.4 },
    ICON_HIGHLIGHT: true, // Add subtle background highlight
  },
  default: {
    ACTIVE_SCALE: 1.06,
    ACTIVE_OPACITY: 1,
    INACTIVE_OPACITY: 0.85,
    ANIMATION_DURATION: 200,
    SPRING_CONFIG: { damping: 16, stiffness: 220, mass: 0.35 },
    ICON_HIGHLIGHT: false,
  },
}) as {
  ACTIVE_SCALE: number;
  ACTIVE_OPACITY: number;
  INACTIVE_OPACITY: number;
  ANIMATION_DURATION: number;
  SPRING_CONFIG: { damping: number; stiffness: number; mass: number };
  ICON_HIGHLIGHT: boolean;
};
