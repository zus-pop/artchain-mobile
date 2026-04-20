/**
 * EnhancedTabBar.tsx - Elegant Bottom Tab Bar
 * Premium, minimal design with subtle active state
 * - Only text/icon color change on active
 * - Minimal text scale increase (no aggressive animation)
 * - No background highlight
 * - Smooth transitions
 */

import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import React, { memo, useEffect } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  PLATFORM_TAB_CONFIG,
  TAB_ICON_SIZE,
  TAB_LABEL_FONT_SIZE,
  TAB_LABEL_FONT_WEIGHT,
} from "@/constants/headerConfig";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

// ============= Colors =============
const ACCENT = "#E25752"; // Active tab color
const INACTIVE_GRAY = "#9CA3AF"; // Inactive tab color (improved readability)
const { width } = Dimensions.get("window");

export const EnhancedTabBar = memo(function EnhancedTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];
  const platformConfig = PLATFORM_TAB_CONFIG;

  const count = state.routes.length;
  const ITEM_W = width / count;

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: (insets.bottom || 8) * 0.8,
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]!;
          const focused = state.index === index;

          const onPress = () => {
            Haptics.selectionAsync();
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          };

          return (
            <EnhancedTabButton
              key={route.key}
              width={ITEM_W}
              focused={focused}
              title={(options.title as string) ?? route.name}
              onPress={onPress}
              onLongPress={onLongPress}
              renderIcon={
                options.tabBarIcon
                  ? (p) =>
                      options.tabBarIcon!({ ...p, size: TAB_ICON_SIZE } as any)
                  : undefined
              }
              activeColor={ACCENT}
              inactiveColor={INACTIVE_GRAY}
            />
          );
        })}
      </View>
    </View>
  );
});

interface EnhancedTabButtonProps {
  width: number;
  focused: boolean;
  title: string;
  onPress: () => void;
  onLongPress?: () => void;
  renderIcon?: (p: { color: string; focused: boolean }) => React.ReactNode;
  activeColor: string;
  inactiveColor: string;
}

const EnhancedTabButton = memo(
  ({
    width,
    focused,
    title,
    onPress,
    onLongPress,
    renderIcon,
    activeColor,
    inactiveColor,
    colors,
  }: EnhancedTabButtonProps) => {
    // Use useSharedValue without effects - update directly in animated style
    const progressValue = useSharedValue(focused ? 1 : 0);

    useEffect(() => {
      progressValue.value = withTiming(focused ? 1 : 0, { duration: 250 });
    }, [focused, progressValue]);

    // Combined animation for both icon scale and text opacity
    const animStyle = useAnimatedStyle(() => {
      const progress = progressValue.value;
      return {
        transform: [
          { scale: 1 + progress * 0.08 }, // 1 -> 1.08
        ],
      };
    });

    // Text opacity animation
    const textAnim = useAnimatedStyle(() => {
      const progress = progressValue.value;
      return {
        opacity: 0.88 + progress * 0.12, // 0.88 -> 1.0
      };
    });

    const currentColor = focused ? activeColor : inactiveColor;

    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        android_ripple={{ color: "rgba(0,0,0,0.04)", borderless: true }}
        style={({ pressed }) => [
          styles.item,
          { width },
          pressed && Platform.select({ ios: { opacity: 0.88 } }),
        ]}
        hitSlop={6}
      >
        {/* Icon with scale animation */}
        <Animated.View style={animStyle}>
          {renderIcon ? renderIcon({ color: currentColor, focused }) : null}
        </Animated.View>

        {/* Label with opacity animation and color change */}
        <Animated.Text
          style={[
            styles.label,
            {
              color: currentColor,
              fontSize: TAB_LABEL_FONT_SIZE,
              fontWeight: TAB_LABEL_FONT_WEIGHT,
            },
            textAnim,
          ]}
          numberOfLines={1}
        >
          {title}
        </Animated.Text>
      </Pressable>
    );
  },
);

EnhancedTabButton.displayName = "EnhancedTabButton";

// ============= Styles =============
const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
    gap: 2,
  },
  label: {
    fontSize: TAB_LABEL_FONT_SIZE,
    fontWeight: TAB_LABEL_FONT_WEIGHT,
    letterSpacing: 0.15,
  },
});
