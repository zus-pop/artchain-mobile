import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type TabItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type Props = {
  tabs: TabItem[];
  activeKey: string;
  onChange: (k: string) => void;
  mutedFg?: string; // màu icon/text chưa chọn
  activeFg?: string; // màu icon/text đang chọn
  height?: number; // chiều cao thanh
  underlineH?: number; // độ dày underline
  trackH?: number; // độ dày thanh mảnh đáy (nền nhạt)
  insetBottom?: number;
  trackColor?: string; // màu nền nhạt thanh đáy
  activeTrackColor?: string; // màu sáng nửa thanh
};

export default function SegmentedTabsProfile({
  tabs,
  activeKey,
  onChange,
  mutedFg = "#9CA3AF",
  activeFg = "#111",
  height = 52,
  underlineH = 2,
  trackH = 1,
  insetBottom = 12,
  trackColor = "rgba(0,0,0,0.15)",
  activeTrackColor = "#111",
}: Props) {
  const [wrapW, setWrapW] = useState(0);
  const tabW = useMemo(
    () => (wrapW > 0 ? wrapW / Math.max(1, tabs.length) : 0),
    [wrapW, tabs.length]
  );

  const activeIdx = Math.max(
    0,
    tabs.findIndex((t) => t.key === activeKey)
  );
  const anim = useRef(new Animated.Value(activeIdx)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: activeIdx,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeIdx]);

  const onWrapLayout = (e: LayoutChangeEvent) =>
    setWrapW(e.nativeEvent.layout.width);

  // underline chạy full mỗi tab
  const underlineTX =
    tabW > 0
      ? anim.interpolate({
          inputRange: tabs.map((_, i) => i),
          outputRange: tabs.map((_, i) => i * tabW),
        })
      : 0;

  // “nửa thanh” sáng ở đáy (chỉ khi đúng 2 tab)
  const isTwoTabs = tabs.length === 2;
  const halfW = wrapW / 2;
  const halfTX =
    isTwoTabs && halfW > 0
      ? anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, halfW],
        })
      : 0;

  return (
    <View
      style={[s.bottomDock, { paddingBottom: insetBottom }]}
      pointerEvents="box-none"
    >
      <View onLayout={onWrapLayout} style={[s.wrap, { height }]}>
        {/* Thanh mảnh đáy (track) */}
        <View
          pointerEvents="none"
          style={[
            s.track,
            {
              height: trackH,
              backgroundColor: trackColor,
            },
          ]}
        />

        {/* Nửa thanh sáng (chỉ 2 tab) */}
        {isTwoTabs && wrapW > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              s.halfActive,
              {
                width: halfW,
                height: trackH,
                backgroundColor: activeTrackColor,
                transform: [{ translateX: halfTX }],
              },
            ]}
          />
        )}

        {/* Underline theo tab (full bề rộng tab) */}
        {tabW > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              s.underline,
              {
                width: tabW,
                height: underlineH,
                backgroundColor: activeFg,
                transform: [{ translateX: underlineTX }],
              },
            ]}
          />
        )}

        {/* Hàng tab (trong suốt, không nền) */}
        <View style={s.row}>
          {tabs.map((t, i) => {
            const isActive = i === activeIdx;
            return (
              <TouchableOpacity
                key={t.key}
                style={s.tab}
                activeOpacity={0.55}
                onPress={() => onChange(t.key)}
              >
                <View style={s.iconLbl}>
                  <Ionicons
                    name={t.icon}
                    size={18}
                    color={isActive ? activeFg : mutedFg}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      s.lbl,
                      {
                        color: isActive ? activeFg : mutedFg,
                        fontWeight: isActive ? "800" : "600",
                      },
                    ]}
                  >
                    {t.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bottomDock: { bottom: 0, width: "90%", alignSelf: "center" },
  wrap: { position: "relative" },

  row: { flex: 1, flexDirection: "row", alignItems: "stretch" },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  iconLbl: { flexDirection: "row", alignItems: "center", gap: 6 },
  lbl: { fontSize: 16, fontFamily: "Be Vietnam Pro" },

  // thanh mảnh đáy (nền nhạt)
  track: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
  },
  // nửa thanh sáng (trượt trái/phải khi 2 tab)
  halfActive: {
    position: "absolute",
    left: 0,
    bottom: 0,
    borderRadius: 999,
  },
  // underline full-width theo tab
  underline: {
    position: "absolute",
    left: 0,
    bottom: 0,
    borderRadius: 999,
  },
});
