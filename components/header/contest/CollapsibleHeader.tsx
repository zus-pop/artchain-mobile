// components/header/contest/CollapsibleHeader.tsx
import { Colors } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Filter, Search } from "lucide-react-native";
import React from "react";
import {
  Animated,
  ImageBackground,
  ImageSourcePropType,
  LayoutChangeEvent,
  Platform,
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
  translateY: Animated.AnimatedInterpolation<number> | Animated.Value;
  /** Tồn tại để tương thích API cũ; không dùng ở đây */
  progress: Animated.AnimatedInterpolation<number>;
  headerOnLayout: (e: LayoutChangeEvent) => void;

  /** Giữ prop để tương thích nơi gọi, dù header không nhập text trực tiếp */
  searchQuery: string;
  onChangeSearch: (txt: string) => void; // not used
  onSubmitSearch?: () => void; // not used

  showFilters: boolean;
  onToggleFilters: () => void;

  selectedFilter: FilterOption;
  onSelectFilter: (opt: FilterOption) => void;
  filterOptions: FilterOption[];

  /** Ảnh nền */
  bgImage?: ImageSourcePropType; // require('...') hoặc { uri }
  /** Safe-area top, dùng để tạo khoảng trắng riêng (không đẩy UI xuống) */
  topInset?: number;
};

export default function CollapsibleHeader({
  scheme,
  translateY,
  headerOnLayout,
  searchQuery,
  onToggleFilters,
  showFilters,
  selectedFilter,
  onSelectFilter,
  filterOptions,
  bgImage = require("@/assets/images/banner/bannerSearch.jpg"),
  topInset = 0,
}: Props) {
  const C = Colors[scheme];
  const s = styles(C);

  const Chip = ({ label, active }: { label: string; active: boolean }) => (
    <Pressable
      onPress={() => onSelectFilter(label as FilterOption)}
      style={({ pressed }) => [
        s.filterOption,
        active && s.filterOptionActive,
        { opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View
        style={[
          s.chipDot,
          { backgroundColor: active ? C.primary : "rgba(255,255,255,0.9)" },
        ]}
      />
      <Text
        style={[s.filterOptionText, active && s.filterOptionTextActive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Animated.View
      onLayout={headerOnLayout}
      style={[
        s.header,
        {
          transform: [{ translateY: translateY as any }],
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 2,
        },
      ]}
    >
      {/* Spacer trắng cho safe-area: KHÔNG đẩy nội dung tìm kiếm xuống */}
      {/* {topInset > 0 && (
        <View
          style={{ paddingTop: topInset, backgroundColor: "#fff", width: "100%" }}
        />
      )} */}

      {/* Ảnh nền + overlay đảm bảo tương phản chữ */}
      <ImageBackground
        source={bgImage}
        defaultSource={Platform.OS === "ios" ? (bgImage as any) : undefined}
        resizeMode="cover"
        style={s.imageBg} // KHÔNG cộng topInset ở đây
        imageStyle={s.imageBgImage}
      >
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.20)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.overlay}
        />

        {/* Tiêu đề */}
        <View style={s.titleWrap} accessible accessibilityRole="header">
          <Text style={s.title} numberOfLines={1}>
            Khám phá cuộc thi
          </Text>
        </View>

        {/* Search + Filter */}
        <View style={s.searchRow}>
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
            <Search size={18} color="#fff" style={s.searchIcon} />
            <Text style={s.searchInput} numberOfLines={1}>
              {searchQuery?.trim()?.length
                ? searchQuery
                : "Tìm kiếm cuộc thi..."}
            </Text>
          </Pressable>

          <Pressable
            onPress={onToggleFilters}
            style={({ pressed }) => [
              s.filterBtn,
              { opacity: pressed ? 0.88 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Mở bộ lọc"
          >
            <Filter size={18} color="#111" />
          </Pressable>
        </View>

        {/* Chips */}
        {showFilters && (
          <View style={{ paddingTop: 12 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filterOptions.map((opt) => (
                <Chip key={opt} label={opt} active={selectedFilter === opt} />
              ))}
            </ScrollView>
          </View>
        )}
      </ImageBackground>

      {/* Hairline dưới cùng */}
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
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      overflow: "hidden",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: "rgba(255,255,255,0.2)",
      backgroundColor: C.card,
    },

    imageBg: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 14,
    },
    imageBgImage: {
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
    },

    titleWrap: { marginBottom: 10 },
    title: {
      fontSize: 18,
      fontWeight: "800",
      color: "#fff",
      letterSpacing: 0.3,
      textShadowColor: "rgba(0,0,0,0.35)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },

    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    searchContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.14)",
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.28)",
    },
    searchIcon: { marginRight: 8, opacity: 0.95 },
    searchInput: {
      flex: 1,
      paddingVertical: 4,
      fontSize: 15,
      color: "#fff",
    },

    filterBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.6)",
    },

    filterOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: "rgba(255,255,255,0.12)",
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.28)",
      marginRight: 10,
    },
    chipDot: { width: 8, height: 8, borderRadius: 4, opacity: 0.95 },
    filterOptionText: {
      fontSize: 13,
      color: "#fff",
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    filterOptionActive: {
      backgroundColor: "#fff",
      borderColor: "transparent",
    },
    filterOptionTextActive: { color: "#111" },

    hairline: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: StyleSheet.hairlineWidth * 2,
      backgroundColor: "rgba(255,255,255,0.35)",
    },
  });
