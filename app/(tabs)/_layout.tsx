// app/(tabs)/_layout.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React, { memo } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const COLS = 3;
const ITEM_W = width / COLS;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].mutedForeground,
      }}
      backBehavior="history"
      //   tabBar={(props) => <WhitePillTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contests"
        options={{
          title: "Contests",
          tabBarIcon: ({ color }) => (
            <Ionicons name="brush" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

/* ------------ White pill wraps all 3 icons ------------ */
const WhitePillTabBar = memo(function WhitePillTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const active = Colors[colorScheme ?? "light"].tint;
  const inactive = Colors[colorScheme ?? "light"].mutedForeground;

  return (
    <View
      style={[styles.barWrap, { paddingBottom: insets.bottom || 0 }]}
      pointerEvents="box-none"
    >
      {/* Nền trắng chung (pill) */}
      <View style={styles.pill}>
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key]!;
            const isFocused = state.index === index;

            const onPress = () => {
              Haptics.selectionAsync();
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented)
                navigation.navigate(route.name, route.params);
            };
            const onLongPress = () => {
              navigation.emit({ type: "tabLongPress", target: route.key });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            };

            return (
              <TabButton
                key={route.key}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                renderIcon={
                  options.tabBarIcon
                    ? (p) => options.tabBarIcon!({ ...p, size: 26 } as any)
                    : undefined
                }
                activeColor={
                  (options.tabBarActiveTintColor as string) ?? active
                }
                inactiveColor={
                  (options.tabBarInactiveTintColor as string) ?? inactive
                }
              />
            );
          })}
        </View>
      </View>
    </View>
  );
});

type ButtonProps = {
  isFocused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  renderIcon?: (p: { color: string; focused: boolean }) => React.ReactNode;
  activeColor: string;
  inactiveColor: string;
};

const TabButton = ({
  isFocused,
  onPress,
  onLongPress,
  renderIcon,
  activeColor,
  inactiveColor,
}: ButtonProps) => {
  const bump = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(isFocused ? -10 : 0, {
          damping: 14,
          stiffness: 160,
        }),
      },
      {
        scale: withSpring(isFocused ? 1.12 : 1, {
          damping: 14,
          stiffness: 180,
        }),
      },
    ],
  }));

  const glow = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 0.65 : 0, { duration: 220 }),
    transform: [{ scale: withTiming(isFocused ? 1 : 0.7, { duration: 220 }) }],
  }));

  const dot = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0, { duration: 220 }),
    transform: [
      { translateY: withTiming(isFocused ? 0 : 6, { duration: 220 }) },
    ],
  }));

  const color = isFocused ? activeColor : inactiveColor;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.9 }]}
      hitSlop={8}
    >
      {/* Glow nhiều màu (nhẹ – nằm trong pill trắng) */}
      <Animated.View style={[styles.glowWrap, glow]}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={[
            "#FF7A7A",
            "#FFB86C",
            "#FFE56C",
            "#7CFF8C",
            "#6CE8FF",
            "#8A7CFF",
            "#FF7AF2",
          ]}
          style={styles.glow}
        />
      </Animated.View>

      {/* Icon trực tiếp */}
      <Animated.View style={bump}>
        {renderIcon ? renderIcon({ color, focused: isFocused }) : null}
      </Animated.View>

      {/* Chấm active */}
      <Animated.View style={[styles.dot, dot]} />
    </Pressable>
  );
};

/* ---------------------------- Styles ---------------------------- */
const styles = StyleSheet.create({
  barWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    paddingTop: 2,
    paddingHorizontal: 12,
  },
  // Pill trắng bọc 3 icon
  pill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  item: {
    width: ITEM_W - 24, // nhỏ hơn chút để chừa padding pill
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  glowWrap: {
    position: "absolute",
    top: -6,
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    zIndex: -1,
    ...Platform.select({ android: { elevation: 0 } }),
  },
  glow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.9,
    shadowColor: "#8A7CFF",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 0,
  },
  dot: {
    marginTop: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8A7CFF",
  },
});
