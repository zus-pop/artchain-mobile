import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

/** Nếu bạn có ColorTokens riêng, bạn có thể thay thế type này */
export type ColorSet = {
  primary: string;
  card: string;
  muted: string;
  mutedForeground: string;
};

export type TabItem = {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: number | string;
  accentColor?: string; // nếu không truyền -> dùng C.primary
};

type Props = {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  C: ColorSet;
  style?: ViewStyle;

  height?: number; // default 44
  gap?: number; // default 12
  underlineHeight?: number; // default 3
  underlineRadius?: number; // default 999
  rounded?: number; // default 12
  softBg?: boolean; // nền mềm (alpha) (default true)
  scrollPaddingHorizontal?: number; // default 12
  autoScrollToActive?: boolean; // đưa tab active ra giữa (default true)
};

function toAlpha(hex: string, a: number) {
  if (!hex) return `rgba(0,0,0,${a})`;
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function SegmentedTabsScrollable({
  tabs,
  activeKey,
  onChange,
  C,
  style,
  height = 44,
  gap = 12,
  underlineHeight = 3,
  underlineRadius = 999,
  rounded = 12,
  softBg = true,
  scrollPaddingHorizontal = 12,
  autoScrollToActive = true,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [tabLayouts, setTabLayouts] = useState<{ x: number; w: number }[]>(
    Array.from({ length: tabs.length }, () => ({ x: 0, w: 0 }))
  );

  const onWrapperLayout = (e: LayoutChangeEvent) =>
    setContainerWidth(e.nativeEvent.layout.width);
  const onContentLayout = (e: LayoutChangeEvent) =>
    setContentWidth(e.nativeEvent.layout.width);

  const handleTabLayout = (i: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setTabLayouts((prev) => {
      const next = [...prev];
      next[i] = { x, w: width };
      return next;
    });
  };

  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.key === activeKey)
  );
  const [prevIndex, setPrevIndex] = useState(activeIndex);

  // Animated (JS driver để animate left/width – tránh lỗi native driver)
  const animLeft = useRef(new Animated.Value(0)).current;
  const animWidth = useRef(new Animated.Value(0)).current;
  const colorProg = useRef(new Animated.Value(1)).current;

  const tabColor = (i: number) => tabs[i]?.accentColor || C.primary;
  const prevColor = useMemo(
    () => tabColor(prevIndex),
    [prevIndex, tabs, C.primary]
  );
  const nextColor = useMemo(
    () => tabColor(activeIndex),
    [activeIndex, tabs, C.primary]
  );

  useEffect(() => {
    const lt = tabLayouts[activeIndex];
    if (!lt || containerWidth <= 0 || contentWidth <= 0) return;

    Animated.parallel([
      Animated.timing(animLeft, {
        toValue: lt.x,
        duration: 220,
        useNativeDriver: false,
      }),
      Animated.timing(animWidth, {
        toValue: lt.w,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();

    colorProg.setValue(0);
    Animated.timing(colorProg, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start(() => setPrevIndex(activeIndex));
  }, [activeIndex, tabLayouts, containerWidth, contentWidth]);

  // Auto-scroll tab active vào giữa
  useEffect(() => {
    if (!autoScrollToActive) return;
    const lt = tabLayouts[activeIndex];
    if (!lt || containerWidth <= 0 || contentWidth <= 0) return;

    const targetCenter = lt.x + lt.w / 2;
    let x = Math.max(targetCenter - containerWidth / 2, 0);
    const maxX = Math.max(contentWidth - containerWidth, 0);
    x = Math.min(x, maxX);
    scrollRef.current?.scrollTo({ x, animated: true });
  }, [
    activeIndex,
    tabLayouts,
    containerWidth,
    contentWidth,
    autoScrollToActive,
  ]);

  const prevOpacity = colorProg.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const nextOpacity = colorProg.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const textInactive = C.mutedForeground;
  const bg = softBg ? toAlpha(C.muted, 0.06) : C.card;

  return (
    <View
      onLayout={onWrapperLayout}
      style={[
        styles.wrapper,
        {
          backgroundColor: bg,
          borderRadius: rounded,
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 0,
        },
        style,
      ]}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: scrollPaddingHorizontal,
          paddingTop: 6,
          paddingBottom: underlineHeight + 8,
          alignItems: "center",
        }}
      >
        <View
          onLayout={onContentLayout}
          style={{
            position: "relative",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/* underline */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.underline,
              {
                left: animLeft,
                width: animWidth,
                opacity: prevOpacity,
                backgroundColor: prevColor,
                height: underlineHeight,
                borderRadius: underlineRadius,
                bottom: 2,
              },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.underline,
              {
                left: animLeft,
                width: animWidth,
                opacity: nextOpacity,
                backgroundColor: nextColor,
                height: underlineHeight,
                borderRadius: underlineRadius,
                bottom: 2,
              },
            ]}
          />

          {tabs.map((t, i) => {
            const active = t.key === activeKey;
            const accent = t.accentColor || C.primary;
            return (
              <Pressable
                key={t.key}
                onLayout={handleTabLayout(i)}
                onPress={() => onChange(t.key)}
                style={{
                  height,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  marginRight: i < tabs.length - 1 ? gap : 0,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                android_ripple={{
                  color: toAlpha(accent, 0.12),
                  borderless: false,
                  radius: 160,
                }}
              >
                {t.icon && (
                  <Ionicons
                    name={t.icon}
                    size={16}
                    color={active ? accent : textInactive}
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    letterSpacing: 0.2,
                    color: active ? accent : textInactive,
                  }}
                >
                  {t.label}
                </Text>

                {t.badge !== undefined && (
                  <View
                    style={{
                      marginLeft: 8,
                      paddingHorizontal: 6,
                      paddingVertical: Platform.select({ ios: 2, android: 1 }),
                      borderRadius: 999,
                      minWidth: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: StyleSheet.hairlineWidth,
                      backgroundColor: active
                        ? toAlpha(accent, 0.12)
                        : toAlpha(textInactive, 0.12),
                      borderColor: active ? accent : toAlpha(textInactive, 0.3),
                    }}
                  >
                    <Text
                      style={{
                        color: active ? accent : textInactive,
                        fontSize: 10,
                        fontWeight: "700",
                      }}
                    >
                      {t.badge}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
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
  underline: {
    position: "absolute",
    zIndex: 1,
  },
});
