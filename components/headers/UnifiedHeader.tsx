/**
 * UnifiedHeader.tsx - Master Header Component
 * Unified, reusable header for all screens
 * Platform-aware (iOS: refined, elegant | Android: Material Design)
 */

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BACK_BUTTON_ICON_SIZE,
  BACK_BUTTON_SIZE,
  HEADER_ELEMENT_GAP,
  HEADER_HEIGHT,
  HEADER_PADDING_HORIZONTAL,
  HeaderConfig,
  HeaderVariant,
  PLATFORM_HEADER_CONFIG,
  RIGHT_ACTION_ICON_SIZE,
  RIGHT_ACTION_SIZE,
  TITLE_FONT_SIZE,
  TITLE_FONT_WEIGHT,
} from "@/constants/headerConfig";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Props = HeaderConfig & {
  scheme?: "light" | "dark";
};

export default function UnifiedHeader({
  title = "",
  showBack = false,
  onBack,
  rightAction,
  rightActions,
  variant = HeaderVariant.DEFAULT,
  backgroundColor,
  borderBottom = true,
  translucent = false,
  scheme: providedScheme,
}: Props) {
  const insets = useSafeAreaInsets();
  const scheme = (providedScheme ?? useColorScheme() ?? "light") as
    | "light"
    | "dark";
  const colors = Colors[scheme];
  const platformConfig = PLATFORM_HEADER_CONFIG;

  const scale = useRef(new Animated.Value(1)).current;
  const backPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 6,
    }).start();
  const backPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();

  const bgColor =
    backgroundColor || (translucent ? "transparent" : colors.card);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const headerHeight = HEADER_HEIGHT + insets.top;
  const styles_ = styles(colors, scheme);

  return (
    <>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={bgColor}
        translucent={translucent}
      />
      <View
        style={[
          styles_.wrap,
          {
            height: headerHeight,
            paddingTop: insets.top,
            backgroundColor: bgColor,
            borderBottomColor: colors.border,
            borderBottomWidth: borderBottom ? StyleSheet.hairlineWidth : 0,
          },
        ]}
      >
        <View style={styles_.content}>
          {/* LEFT: Back Button */}
          <View style={styles_.left}>
            {showBack ? (
              <Animated.View style={{ transform: [{ scale }] }}>
                <Pressable
                  onPress={handleBack}
                  onPressIn={backPressIn}
                  onPressOut={backPressOut}
                  android_ripple={{
                    color: "rgba(0,0,0,0.08)",
                    borderless: true,
                  }}
                  style={({ pressed }) => [
                    styles_.backButton,
                    {
                      width: BACK_BUTTON_SIZE,
                      height: BACK_BUTTON_SIZE,
                      backgroundColor: pressed
                        ? "rgba(0,0,0,0.06)"
                        : "transparent",
                    },
                  ]}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                >
                  <Ionicons
                    name={platformConfig.BACK_ICON as any}
                    size={BACK_BUTTON_ICON_SIZE}
                    color={colors.foreground}
                  />
                </Pressable>
              </Animated.View>
            ) : null}
          </View>

          {/* CENTER: Title */}
          <View
            style={[
              styles_.center,
              {
                paddingHorizontal:
                  Platform.OS === "ios" ? HEADER_ELEMENT_GAP : 0,
              },
            ]}
          >
            <Text
              style={[
                styles_.title,
                {
                  textAlign: platformConfig.TITLE_ALIGN,
                  color: colors.foreground,
                },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>

          {/* RIGHT: Action(s) */}
          <View style={styles_.right}>
            {rightAction ? (
              <View
                style={{
                  width: RIGHT_ACTION_SIZE,
                  height: RIGHT_ACTION_SIZE,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {rightAction}
              </View>
            ) : rightActions && rightActions.length > 0 ? (
              <View style={{ flexDirection: "row", gap: HEADER_ELEMENT_GAP }}>
                {rightActions.map((action, idx) => (
                  <Pressable
                    key={idx}
                    onPress={action.onPress}
                    android_ripple={{ color: "rgba(0,0,0,0.08)" }}
                    style={{
                      width: RIGHT_ACTION_SIZE,
                      height: RIGHT_ACTION_SIZE,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    testID={action.testID}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={action.icon as any}
                      size={RIGHT_ACTION_ICON_SIZE}
                      color={colors.foreground}
                    />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = (colors: typeof Colors.light, scheme: "light" | "dark") =>
  StyleSheet.create({
    wrap: {
      justifyContent: "flex-end",
      flexDirection: "column",
      backgroundColor: colors.card,
      shadowColor: scheme === "dark" ? "#000" : "#00000020",
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
      gap: HEADER_ELEMENT_GAP,
    },
    left: {
      width: BACK_BUTTON_SIZE,
      height: HEADER_HEIGHT,
      justifyContent: "center",
      alignItems: "center",
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: Platform.OS === "ios" ? "center" : "flex-start",
    },
    right: {
      width: RIGHT_ACTION_SIZE,
      height: HEADER_HEIGHT,
      justifyContent: "center",
      alignItems: "flex-end",
    },
    title: {
      fontSize: TITLE_FONT_SIZE,
      fontWeight: TITLE_FONT_WEIGHT as any,
      letterSpacing: 0.3,
    },
    backButton: {
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
  });
