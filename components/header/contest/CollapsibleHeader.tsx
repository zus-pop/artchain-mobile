// components/header/contest/CollapsibleHeader.tsx
import { Colors } from "@/constants/theme";
import { router } from "expo-router"; // ⬅️ thêm
import { Filter, Search } from "lucide-react-native";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type FilterOption =
  | "Tất cả"
  | "Đang diễn ra"
  | "Sắp diễn ra"
  | "Đã kết thúc"
  | "Hoàn thành";

type Props = {
  scheme: "light" | "dark";
  translateY: Animated.AnimatedInterpolation<number>; // [-headerHeight..0]
  progress: Animated.AnimatedInterpolation<number>; // 0: mở, 1: ẩn
  headerOnLayout: (e: LayoutChangeEvent) => void;

  searchQuery: string;
  onChangeSearch: (txt: string) => void; // vẫn giữ prop để tương thích nơi dùng

  showFilters: boolean;
  onToggleFilters: () => void;

  selectedFilter: FilterOption;
  onSelectFilter: (opt: FilterOption) => void;
  filterOptions: FilterOption[];
};

export default function CollapsibleHeader({
  scheme,
  translateY,
  progress,
  headerOnLayout,
  searchQuery,
  onChangeSearch, // hiện không dùng trực tiếp ở đây (search làm ở screen mới)
  showFilters,
  onToggleFilters,
  selectedFilter,
  onSelectFilter,
  filterOptions,
}: Props) {
  const C = Colors[scheme];
  const s = styles(C);

  // ====== Anim helpers (màu chuyển nhịp) ======
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: false, // đổi màu => JS driver
      })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // Bảng màu tươi
  const palette = useMemo(
    () => [
      C.chart1 || "#F59E0B", // amber
      C.chart2 || "#22C55E", // green
      C.chart3 || "#3B82F6", // blue
      C.primary || "#7C3AED", // violet
      C.accent || "#EF4444", // red
    ],
    [C]
  );

  // Chu kỳ màu
  const colorCycle = pulse.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [palette[0], palette[1], palette[2], palette[3], palette[0]],
  });

  // Parallax blobs (native driver áp vào transform)
  const blobScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });
  const blobTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
    extrapolate: "clamp",
  });

  // Search row anim
  const searchOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.12],
    extrapolate: "clamp",
  });
  const searchScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95],
    extrapolate: "clamp",
  });

  // Chip nhấn mượt
  const Chip = ({ label, active }: { label: string; active: boolean }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const onIn = () =>
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
    const onOut = () =>
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    return (
      <Animated.View style={{ transform: [{ scale }], marginRight: 10 }}>
        <Pressable
          onPressIn={onIn}
          onPressOut={onOut}
          onPress={() => onSelectFilter(label as FilterOption)}
          style={[
            s.filterOption,
            active && s.filterOptionActive,
            { borderColor: active ? "transparent" : C.border },
          ]}
        >
          <Animated.View
            style={[
              s.chipDot,
              { backgroundColor: active ? "#fff" : colorCycle },
            ]}
          />
          <Text
            style={[s.filterOptionText, active && s.filterOptionTextActive]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  // ====== Nền nghệ thuật (đÃ TÁCH LỚP) ======
  const AccentBG = useMemo(
    () => (
      <>
        {/* BLOB TRÁI */}
        <Animated.View
          style={[
            s.blobOuter,
            {
              left: -60,
              top: -26,
              transform: [
                { scale: blobScale }, // native
                { translateY: blobTranslateY }, // native
                { rotate: "-12deg" }, // native
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              s.blobInner,
              { backgroundColor: colorCycle, opacity: 0.18 },
            ]}
          />
        </Animated.View>

        {/* BLOB PHẢI */}
        <Animated.View
          style={[
            s.blobOuter,
            {
              right: -70,
              top: -18,
              transform: [
                { scale: blobScale }, // native
                { translateY: blobTranslateY }, // native
                { rotate: "14deg" }, // native
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              s.blobInner,
              { backgroundColor: palette[2], opacity: 0.14 },
            ]}
          />
        </Animated.View>

        {/* Dots pattern + rainbow */}
        <View style={s.dotsWrap}>
          {Array.from({ length: 18 }).map((_, i) => (
            <View key={i} style={s.dot} />
          ))}
        </View>
        <View style={s.rainbowRow}>
          <View style={[s.rainbowBar, { backgroundColor: palette[0] }]} />
          <View style={[s.rainbowBar, { backgroundColor: palette[1] }]} />
          <View style={[s.rainbowBar, { backgroundColor: palette[2] }]} />
          <View style={[s.rainbowBar, { backgroundColor: palette[3] }]} />
          <View style={[s.rainbowBar, { backgroundColor: palette[4] }]} />
        </View>
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scheme, palette, colorCycle, blobScale, blobTranslateY]
  );

  return (
    <Animated.View
      onLayout={headerOnLayout}
      style={[
        s.header,
        {
          transform: [{ translateY }],
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        },
      ]}
    >
      {/* Nền & kính mờ */}
      <View style={s.accentWrap}>{AccentBG}</View>
      <View style={s.glass} />

      {/* Hàng tìm kiếm + nút filter */}
      <Animated.View
        style={[
          s.searchRow,
          { opacity: searchOpacity, transform: [{ scale: searchScale }] },
        ]}
      >
        {/* ⬇️ Nút mở Search Screen (thay cho TextInput) */}
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/searchContest",
              params: { q: searchQuery ?? "" },
            })
          }
          style={({ pressed }) => [
            s.searchContainer,
            { opacity: pressed ? 0.9 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Mở màn hình tìm kiếm"
        >
          <Search size={18} color={C.mutedForeground} style={s.searchIcon} />
          <Text style={s.searchInput} numberOfLines={1}>
            {searchQuery?.trim()?.length ? searchQuery : "Tìm kiếm cuộc thi..."}
          </Text>

          {/* viền nhịp sắc động giữ nguyên */}
          <Animated.View
            pointerEvents="none"
            style={[s.searchBorderPulse, { backgroundColor: colorCycle }]}
          />
        </Pressable>

        <Pressable
          onPress={onToggleFilters}
          style={({ pressed }) => [
            s.filterBtn,
            { opacity: pressed ? 0.88 : 1, backgroundColor: C.primary },
          ]}
        >
          <Filter size={18} color={C.primaryForeground} />
        </Pressable>
      </Animated.View>

      {/* Chips lọc */}
      {showFilters && (
        <Animated.View
          style={{
            paddingTop: 12,
            opacity: searchOpacity,
            transform: [{ scale: searchScale }],
          }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filterOptions.map((opt) => (
              <Chip key={opt} label={opt} active={selectedFilter === opt} />
            ))}
          </ScrollView>
        </Animated.View>
      )}

      <View style={s.hairline} />
    </Animated.View>
  );
}

const styles = (C: any) =>
  StyleSheet.create({
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      backgroundColor: "transparent",
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 14,
    },

    glass: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: C.card + (C.card?.length === 7 ? "E6" : ""), // nếu hex -> thêm alpha
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },

    // ===== BG nghệ thuật =====
    accentWrap: {
      ...StyleSheet.absoluteFillObject,
      overflow: "hidden",
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },

    // TÁCH LỚP: outer nhận transform (native), inner nhận color (JS)
    blobOuter: {
      position: "absolute",
      width: 200,
      height: 100,
      borderRadius: 30,
      overflow: "hidden",
    },
    blobInner: {
      position: "absolute",
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      borderRadius: 30,
    },

    dotsWrap: {
      position: "absolute",
      right: 14,
      top: 12,
      width: 80,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      opacity: 0.18,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: C.border,
    },
    rainbowRow: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 3,
      flexDirection: "row",
      opacity: 0.9,
    },
    rainbowBar: { flex: 1 },

    // ===== Nội dung =====
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    searchContainer: {
      flex: 1,
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.input,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
      overflow: "hidden",
    },
    searchIcon: { marginRight: 8, opacity: 0.85 },
    searchInput: {
      flex: 1,
      paddingVertical: 4,
      fontSize: 15,
      color: C.foreground,
    },
    searchBorderPulse: {
      position: "absolute",
      left: -2,
      right: -2,
      top: -2,
      bottom: -2,
      borderRadius: 18,
      opacity: 0.12,
    },

    filterBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },

    filterOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: C.input,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
    },
    chipDot: { width: 8, height: 8, borderRadius: 4, opacity: 0.9 },
    filterOptionActive: {
      backgroundColor: C.primary,
      borderColor: "transparent",
    },
    filterOptionText: {
      fontSize: 13,
      color: C.mutedForeground,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    filterOptionTextActive: { color: C.primaryForeground },

    hairline: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: StyleSheet.hairlineWidth * 2,
      backgroundColor: C.border,
      opacity: 0.5,
    },
  });
