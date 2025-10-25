import type { ColorTokens } from "@/types/tabkey";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

export type TabItem = {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: number | string;
  accentColor?: string; // màu nhấn riêng từng tab (fallback C.primary)
};

type Props = {
  tabs: [TabItem, TabItem]; // chỉ 2 tab
  activeKey: string;
  onChange: (key: string) => void;
  C: ColorTokens;
  style?: ViewStyle;
  height?: number; // default 48
  gap?: number; // khoảng trống giữa 2 tab (default 8)
  underlineHeight?: number; // độ dày gạch chân (default 3)
  underlineRadius?: number; // bo gạch chân (default 999)
  rounded?: number; // bo góc container (default 12)
  softBg?: boolean; // nền mềm nhẹ (default true)
};

function toAlpha(hex: string, a: number) {
  if (!hex) return `rgba(0,0,0,${a})`;
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function SegmentedTabsUnderlineTwo({
  tabs,
  activeKey,
  onChange,
  C,
  style,
  height = 48,
  gap = 8,
  underlineHeight = 3,
  underlineRadius = 999,
  rounded = 12,
  softBg = true,
}: Props) {
  // đảm bảo đúng 2 tab
  const [leftTab, rightTab] = tabs;

  const [containerWidth, setContainerWidth] = useState(0);
  const onWrapLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const activeIndex = activeKey === rightTab.key ? 1 : 0;
  const prevIndexRef = useRef(activeIndex);

  const half = Math.max(0, (containerWidth - gap - 8) / 2); // -8 là padding ngang 4+4
  const leftStart = 4; // paddingLeft của wrapper
  const rightStart = leftStart + half + gap; // vị trí tab phải

  // Animated values (JS driver vì animate 'left' & 'width')
  const animLeft = useRef(new Animated.Value(leftStart)).current;
  const animWidth = useRef(new Animated.Value(half)).current;
  const colorProg = useRef(new Animated.Value(1)).current;

  const tabColor = (i: number) =>
    i === 0
      ? leftTab.accentColor || C.primary
      : rightTab.accentColor || C.primary;
  const prevColor = useMemo(
    () => tabColor(prevIndexRef.current),
    [leftTab, rightTab, C.primary]
  );
  const nextColor = useMemo(
    () => tabColor(activeIndex),
    [activeIndex, leftTab, rightTab, C.primary]
  );

  useEffect(() => {
    // khi containerWidth đổi -> reset width/left theo activeIndex
    if (containerWidth <= 0) return;
    const targetLeft = activeIndex === 0 ? leftStart : rightStart;
    Animated.parallel([
      Animated.timing(animLeft, {
        toValue: targetLeft,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(animWidth, {
        toValue: half,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();

    colorProg.setValue(0);
    Animated.timing(colorProg, {
      toValue: 1,
      duration: 160,
      useNativeDriver: false,
    }).start(() => {
      prevIndexRef.current = activeIndex;
    });
  }, [activeIndex, containerWidth, half, leftStart, rightStart]);

  const prevOpacity = colorProg.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const nextOpacity = colorProg.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const textInactive = C.mutedForeground;
  const bg = softBg ? toAlpha(C.muted ?? "#000000", 0.04) : C.card;

  return (
    <View
      onLayout={onWrapLayout}
      style={[
        styles.wrapper,
        {
          backgroundColor: bg,
          borderRadius: rounded,
          // ❌ bỏ borderWidth theo yêu cầu
          // mềm mịn: bóng nhẹ
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 0,
          paddingHorizontal: 4,
          paddingVertical: 4,
        },
        style,
      ]}
    >
      {/* Underline prev/next (crossfade màu), luôn dưới chữ */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.underline,
          {
            height: underlineHeight,
            borderRadius: underlineRadius,
            left: animLeft,
            width: animWidth,
            opacity: prevOpacity,
            backgroundColor: prevColor,
            bottom: 2,
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.underline,
          {
            height: underlineHeight,
            borderRadius: underlineRadius,
            left: animLeft,
            width: animWidth,
            opacity: nextOpacity,
            backgroundColor: nextColor,
            bottom: 2,
          },
        ]}
      />

      {/* Hàng 2 tab bằng nhau */}
      <View style={[styles.row, { height }]}>
        {/* Tab trái */}
        <Pressable
          onPress={() => onChange(leftTab.key)}
          style={[styles.tab, { marginRight: gap / 2 }]}
          android_ripple={{
            color: toAlpha(tabColor(0), 0.12),
            borderless: false,
            radius: 160,
          }}
        >
          {leftTab.icon && (
            <Ionicons
              name={leftTab.icon}
              size={16}
              color={activeIndex === 0 ? tabColor(0) : textInactive}
              style={{ marginRight: 6 }}
            />
          )}
          <Text
            style={[
              styles.label,
              { color: activeIndex === 0 ? tabColor(0) : textInactive },
            ]}
          >
            {leftTab.label}
          </Text>
          {leftTab.badge !== undefined && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    activeIndex === 0
                      ? toAlpha(tabColor(0), 0.12)
                      : toAlpha(textInactive, 0.12),
                  borderColor:
                    activeIndex === 0
                      ? tabColor(0)
                      : toAlpha(textInactive, 0.3),
                },
              ]}
            >
              <Text
                style={{
                  color: activeIndex === 0 ? tabColor(0) : textInactive,
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                {leftTab.badge}
              </Text>
            </View>
          )}
        </Pressable>

        {/* Tab phải */}
        <Pressable
          onPress={() => onChange(rightTab.key)}
          style={[styles.tab, { marginLeft: gap / 2 }]}
          android_ripple={{
            color: toAlpha(tabColor(1), 0.12),
            borderless: false,
            radius: 160,
          }}
        >
          {rightTab.icon && (
            <Ionicons
              name={rightTab.icon}
              size={16}
              color={activeIndex === 1 ? tabColor(1) : textInactive}
              style={{ marginRight: 6 }}
            />
          )}
          <Text
            style={[
              styles.label,
              { color: activeIndex === 1 ? tabColor(1) : textInactive },
            ]}
          >
            {rightTab.label}
          </Text>
          {rightTab.badge !== undefined && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    activeIndex === 1
                      ? toAlpha(tabColor(1), 0.12)
                      : toAlpha(textInactive, 0.12),
                  borderColor:
                    activeIndex === 1
                      ? tabColor(1)
                      : toAlpha(textInactive, 0.3),
                },
              ]}
            >
              <Text
                style={{
                  color: activeIndex === 1 ? tabColor(1) : textInactive,
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                {rightTab.badge}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    flex: 1, // mỗi tab chiếm 1/2
    height: "100%",
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: Platform.select({ ios: 2, android: 1 }),
    borderRadius: 999,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  underline: {
    position: "absolute",
    zIndex: 1, // dưới chữ
  },
});
