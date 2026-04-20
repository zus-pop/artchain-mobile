/**
 * UnifiedHeader.tsx - Master Header Component
 * Unified, reusable header for all screens
 * Platform-aware (iOS: refined, elegant | Android: Material Design)
 */

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  HEADER_HEIGHT,
  HEADER_PADDING_HORIZONTAL,
  TITLE_FONT_SIZE,
  TITLE_FONT_WEIGHT,
} from "@/constants/headerConfig";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Props = {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  backgroundColor?: string;
  borderBottom?: boolean;
  scheme?: "light" | "dark";
};

export default function UnifiedHeader({
  title = "",
  showBack = false,
  onBack,
  backgroundColor,
  borderBottom = true,
  scheme: providedScheme,
}: Props) {
  const insets = useSafeAreaInsets();
  const scheme = (providedScheme ?? useColorScheme() ?? "light") as
    | "light"
    | "dark";
  const colors = Colors[scheme];

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // 🔴 FIX JUMP: Lock safe-area inset on mount (empty deps = never updates)
  const topInset = useMemo(() => {
    if (insets.top === 0) {
      return Platform.OS === "ios" ? 44 : 0;
    }
    return insets.top;
  }, []); // ⭐ CRITICAL: Empty array = value locked forever

  const headerHeight = HEADER_HEIGHT + topInset;
  const bgColor = backgroundColor || colors.card;

  return (
    <>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={bgColor}
      />
      <View
        style={[
          s.wrap,
          {
            height: headerHeight,
            paddingTop: topInset,
            backgroundColor: bgColor,
            borderBottomColor: colors.border,
            borderBottomWidth: borderBottom ? StyleSheet.hairlineWidth : 0,
          },
        ]}
      >
        <View style={s.content}>
          {/* Back Button */}
          {showBack ? (
            <Pressable
              onPress={handleBack}
              style={s.backButton}
              android_ripple={{ color: "rgba(0,0,0,0.08)" }}
              hitSlop={8}
            >
              <Ionicons
                name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
                size={24}
                color={colors.foreground}
              />
            </Pressable>
          ) : (
            <View style={{ width: 48 }} />
          )}

          {/* Title */}
          <Text
            style={[
              s.title,
              {
                color: colors.foreground,
              },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>

          {/* Spacer */}
          <View style={{ width: 48 }} />
        </View>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  wrap: {
    justifyContent: "flex-end",
    flexDirection: "column",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  content: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: HEADER_PADDING_HORIZONTAL,
    gap: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: TITLE_FONT_SIZE,
    fontWeight: TITLE_FONT_WEIGHT as any,
    textAlign: "center",
  },
});
