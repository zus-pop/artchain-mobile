import type { ColorTokens } from "@/types/tabkey";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

export type GuardianTabKey = "children" | "contests" | "achievements";

type Props = {
  C: ColorTokens;
  activeTab: GuardianTabKey;
  onChange: (k: GuardianTabKey) => void;
  style?: ViewStyle;
};

/** Mỗi tab có icon và gradient riêng để “đã mắt” hơn */
const TABS = [
  {
    key: "children",
    label: "Con em",
    icon: "people-outline",
    grad: ["#06B6D4", "#3B82F6"], // cyan → blue
  },
  {
    key: "contests",
    label: "Cuộc thi",
    icon: "time-outline",
    grad: ["#F59E0B", "#F97316"], // amber → orange
  },
  {
    key: "achievements",
    label: "Thành tích",
    icon: "trophy-outline",
    grad: ["#A78BFA", "#EC4899"], // violet → pink
  },
] as const;

export default function GuardianTabs({ C, activeTab, onChange, style }: Props) {
  const tabCount = TABS.length;
  const [containerW, setContainerW] = useState(0);
  const activeIndex = useMemo(
    () =>
      Math.max(
        0,
        TABS.findIndex((t) => t.key === activeTab)
      ),
    [activeTab]
  );

  // animated positions + tiny spring for smooth slide
  const pos = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!containerW) return;
    const tabW = containerW / tabCount;
    Animated.spring(pos, {
      toValue: activeIndex * tabW,
      mass: 0.6,
      damping: 14,
      stiffness: 140,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, containerW, tabCount, pos]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContainerW(w);
    pos.setValue((w / tabCount) * activeIndex);
  };

  const tabW = containerW / tabCount || 0;
  const activeGrad = TABS[activeIndex]?.grad ?? ["#999", "#777"];

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.wrap,
        // “glass card” nhẹ — không viền, không borderWidth
        { backgroundColor: C.card + "E6" },
        style,
      ]}
    >
      {/* Nền dưới cùng: dải gradient mờ chạy ngang cho sang hơn */}
      <LinearGradient
        colors={[C.card + "00", C.card + "33", C.card + "00"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.subtleStripe}
      />

      {/* Hàng tab */}
      <View style={styles.row}>
        {TABS.map((t, i) => {
          const active = i === activeIndex;
          return (
            <Pressable
              key={t.key}
              onPress={() => onChange(t.key)}
              android_ripple={{ color: C.muted + "40" }}
              style={styles.tab}
            >
              {/* Icon “viền gradient” */}
              <LinearGradient
                colors={t.grad as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.iconRing,
                  // active → ring lớn hơn 1 chút
                  active && styles.iconRingActive,
                ]}
              >
                <View
                  style={[
                    styles.iconInner,
                    { backgroundColor: active ? C.card : C.card + "EE" },
                  ]}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={22}
                    color={active ? C.primary : C.mutedForeground}
                    style={{ transform: [{ translateY: -0.5 }] }}
                  />
                </View>
              </LinearGradient>

              {/* Nhãn */}
              <Text
                numberOfLines={1}
                style={[
                  styles.tabText,
                  { color: active ? C.primary : C.mutedForeground },
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Thanh trượt phía dưới — gradient theo tab đang chọn, không viền */}
      <View style={styles.indicatorHost}>
        <Animated.View
          style={[
            {
              width: tabW * 0.62,
              transform: [
                {
                  translateX: Animated.add(
                    pos,
                    new Animated.Value(tabW * 0.19)
                  ),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={activeGrad as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.indicator, { shadowColor: activeGrad[1] ?? "#000" }]}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 16,
    paddingTop: 8,

    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    overflow: "hidden",
  },
  subtleStripe: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 1,
    paddingBottom: 5, // chừa chỗ cho indicator
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 1,
    paddingHorizontal: 4,
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  iconRing: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.95,
  },
  iconRingActive: {
    width: 42,
    height: 42,
    borderRadius: 18,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  iconInner: {
    width: "82%",
    height: "82%",
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorHost: {
    height: 8,
    alignItems: "flex-start",
    justifyContent: "flex-end",
  },
  indicator: {
    height: 4,
    borderRadius: 999,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
});
