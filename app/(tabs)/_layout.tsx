// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import React, { memo, useEffect } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ===== Palette ===== */
const ACCENT = "#E25752"; // cam nhạt (active)
const INACTIVE_GRAY = "#6B7280"; // xám (inactive)
const WHITE = "#FFFFFF"; // nền
const BORDER = "#E5E7EB"; // viền nhạt
const { width } = Dimensions.get("window");

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: INACTIVE_GRAY,
      }}
      backBehavior="history"
      tabBar={(p) => <EdgeTabBar {...p} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contests"
        options={{
          title: "Contests",
          tabBarIcon: ({ color }) => (
            <Ionicons name="brush" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

/* ================= Compact Edge TabBar ================= */
const EdgeTabBar = memo(function EdgeTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const count = state.routes.length;
  const ITEM_W = width / count;

  const idx = useSharedValue(state.index);
  useEffect(() => {
    idx.value = withSpring(state.index, {
      damping: 18,
      stiffness: 220,
      mass: 0.35,
    });
  }, [state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: idx.value * ITEM_W }],
  }));

  return (
    <View style={[styles.bar, { paddingBottom: (insets.bottom || 8) * 0.8 }]}>
      {/* gạch chân active (mảnh hơn) */}
      <Animated.View
        style={[
          styles.indicator,
          { width: ITEM_W - 20 /* chừa 10px mỗi bên */ },
          indicatorStyle,
        ]}
      />
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
            if (!focused && !event.defaultPrevented)
              navigation.navigate(route.name, route.params);
          };
          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          };

          return (
            <TabButton
              key={route.key}
              width={ITEM_W}
              focused={focused}
              title={(options.title as string) ?? route.name}
              onPress={onPress}
              onLongPress={onLongPress}
              renderIcon={
                options.tabBarIcon
                  ? (p) => options.tabBarIcon!({ ...p, size: 22 } as any)
                  : undefined
              }
            />
          );
        })}
      </View>
    </View>
  );
});

type TBtnProps = {
  width: number;
  focused: boolean;
  title: string;
  onPress: () => void;
  onLongPress?: () => void;
  renderIcon?: (p: { color: string; focused: boolean }) => React.ReactNode;
};

const TabButton = ({
  width,
  focused,
  title,
  onPress,
  onLongPress,
  renderIcon,
}: TBtnProps) => {
  const aStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(focused ? -1 : 0, {
          damping: 16,
          stiffness: 220,
        }),
      },
      {
        scale: withSpring(focused ? 1.04 : 1, { damping: 16, stiffness: 220 }),
      },
    ],
    opacity: withTiming(focused ? 1 : 0.85, { duration: 140 }),
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: "rgba(0,0,0,0.05)", borderless: true }}
      style={({ pressed }) => [
        styles.item,
        { width },
        pressed && Platform.select({ ios: { opacity: 0.92 } }),
      ]}
      hitSlop={6}
    >
      <Animated.View style={aStyle}>
        {renderIcon
          ? renderIcon({ color: focused ? ACCENT : INACTIVE_GRAY, focused })
          : null}
      </Animated.View>
      <Text style={styles.label} numberOfLines={1}>
        {title}
      </Text>
    </Pressable>
  );
};

/* ============================= Styles ============================= */
const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: WHITE, // nền trắng
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4, // nhỏ hơn
    gap: 1,
  },
  label: {
    fontSize: 10, // nhỏ hơn
    fontWeight: "700",
    letterSpacing: 0.15,
    color: INACTIVE_GRAY, // chữ xám
  },
  indicator: {
    position: "absolute",
    bottom: 5,
    left: 10,
    height: 2, // mảnh hơn
    backgroundColor: ACCENT, // gạch chân cam nhạt
    borderRadius: 2,
  },
});
