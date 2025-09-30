// components/tabs/SegmentTabs.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type TabItem = { key: string; label: string };

type Props = {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  // Màu đem từ theme vào (để tự đồng bộ light/dark)
  colors: {
    background: string;
    card: string;
    foreground: string;
    mutedForeground: string;
    border: string;
    primary: string;
  };
};

export default function SegmentTabs({
  tabs,
  activeKey,
  onChange,
  colors,
}: Props) {
  const s = useMemo(() => styles(colors), [colors]);
  const [wrapW, setWrapW] = useState(0);
  const index = Math.max(
    0,
    tabs.findIndex((t) => t.key === activeKey)
  ); // fallback 0
  const translateX = useRef(new Animated.Value(0)).current;

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWrapW(w);
    // reset indicator vị trí nếu lần đầu
    Animated.timing(translateX, {
      toValue: (w / tabs.length) * index,
      duration: 0,
      useNativeDriver: true,
    }).start();
  };

  // animate khi activeKey đổi
  React.useEffect(() => {
    if (wrapW === 0) return;
    Animated.spring(translateX, {
      toValue: (wrapW / tabs.length) * index,
      useNativeDriver: true,
      stiffness: 260,
      damping: 24,
      mass: 0.9,
    }).start();
  }, [activeKey, wrapW]);

  const itemW = wrapW > 0 ? wrapW / tabs.length : undefined;

  return (
    <View style={s.wrap} onLayout={onLayout}>
      {/* Indicator — không đổi chiều cao hàng tab */}
      <Animated.View
        style={[
          s.indicator,
          { width: itemW ?? 0 },
          { transform: [{ translateX }] },
        ]}
      />
      {tabs.map((t) => {
        const selected = t.key === activeKey;
        return (
          <TouchableOpacity
            key={t.key}
            style={s.item}
            activeOpacity={0.7}
            onPress={() => onChange(t.key)}
          >
            <Text
              numberOfLines={1}
              style={[s.label, { opacity: selected ? 1 : 0.45 }]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = (C: any) =>
  StyleSheet.create({
    wrap: {
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
      height: 46, // cố định chiều cao
      marginTop: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
      paddingHorizontal: 6,
      backgroundColor: C.background,
    },
    item: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
    },
    label: {
      fontSize: 13,
      fontWeight: "700",
      color: C.foreground, // giữ cùng size/weight để tránh "phình"
    },
    indicator: {
      position: "absolute",
      bottom: -1.5, // chạm viền dưới
      height: 3,
      backgroundColor: C.primary, // nổi bật hơn foreground
      borderRadius: 3,
      left: 6, // khớp paddingHorizontal
    },
  });
