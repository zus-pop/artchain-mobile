// components/header/contest/CollapsibleHeader.tsx
import { Colors } from "@/constants/theme";
import { Filter, Search, X } from "lucide-react-native";
import React from "react";
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export type FilterOption =
  | "Tất cả"
  | "Đang diễn ra"
  | "Sắp diễn ra"
  | "Đã kết thúc";

type Props = {
  scheme: "light" | "dark";
  translateY: Animated.AnimatedInterpolation<number> | Animated.Value;
  /** giữ để tương thích API cũ */
  progress?: Animated.AnimatedInterpolation<number>;
  headerOnLayout: (e: LayoutChangeEvent) => void;

  searchQuery: string;
  onChangeSearch: (txt: string) => void; // not used
  onSubmitSearch?: () => void; // not used

  showFilters: boolean;
  onToggleFilters: () => void;

  selectedFilter: FilterOption;
  onSelectFilter: (opt: FilterOption) => void;
  filterOptions: FilterOption[];

  /** Safe-area top (from useSafeAreaInsets) */
  topInset?: number;
};

export default function CollapsibleHeader({
  scheme,
  translateY,
  headerOnLayout,
  searchQuery,
  onChangeSearch,
  onToggleFilters,
  showFilters,
  selectedFilter,
  onSelectFilter,
  filterOptions,
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
          { backgroundColor: active ? "#fff" : C.mutedForeground },
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
          backgroundColor: C.foreground80,
        },
      ]}
    >
      {/* Simple Background */}
      <View style={[s.contentBg, { paddingTop: 14 + topInset }]}>
        {/* Title */}
        <View style={s.titleWrap} accessible accessibilityRole="header">
          <Text style={s.title} numberOfLines={1}>
            Khám Phá Cuộc Thi
          </Text>
        </View>

        {/* Search + Filter */}
        <View style={s.searchRow}>
          <View style={s.searchContainer}>
            <Search size={18} color={C.mutedForeground} style={s.searchIcon} />
            <TextInput
              placeholder="Tìm kiếm cuộc thi..."
              placeholderTextColor={C.mutedForeground}
              value={searchQuery}
              onChangeText={onChangeSearch}
              style={s.searchInput}
              maxLength={50}
              clearButtonMode="while-editing"
            />
            {searchQuery.trim().length > 0 && (
              <Pressable
                onPress={() => onChangeSearch("")}
                style={{ padding: 4 }}
              >
                <X size={16} color={C.mutedForeground} />
              </Pressable>
            )}
          </View>

          <Pressable
            onPress={onToggleFilters}
            style={({ pressed }) => [
              s.filterBtn,
              { opacity: pressed ? 0.88 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Mở bộ lọc"
          >
            <Filter size={18} color={C.foreground} />
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
      </View>

      {/* Hairline */}
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
      zIndex: 30, // nâng cao hơn để chắn nội dung dưới
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      overflow: "hidden",
      backgroundColor: C.card,
    },

    contentBg: {
      paddingHorizontal: 16,
      paddingBottom: 14,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      overflow: "hidden",
    },
    overlay: { ...StyleSheet.absoluteFillObject },

    titleWrap: { marginBottom: 10 },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: "white",
      letterSpacing: 0.3,
    },

    searchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    searchContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.background,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: C.border,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: C.foreground,
      fontWeight: "500",
      padding: 0,
    },

    filterBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.background,
      borderWidth: 1,
      borderColor: C.border,
    },

    filterOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: C.background,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: C.border,
      marginRight: 10,
    },
    chipDot: { width: 8, height: 8, borderRadius: 4 },
    filterOptionText: {
      fontSize: 13,
      color: C.mutedForeground,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    filterOptionActive: {
      backgroundColor: C.primary,
      borderColor: "transparent",
    },
    filterOptionTextActive: { color: "#fff" },

    hairline: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: StyleSheet.hairlineWidth,
      backgroundColor: C.border,
    },
  });
