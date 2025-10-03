// app/(tabs)/contests.tsx
import { useContest } from "@/apis/contest";
import { ContestCard } from "@/components/ContestCard";
import CollapsibleHeader, {
  FilterOption,
} from "@/components/header/contest/CollapsibleHeader";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";

const filterOptions: FilterOption[] = [
  "Tất cả",
  "Đang diễn ra",
  "Sắp diễn ra",
  "Đã kết thúc",
  "Hoàn thành",
];

function mapFilterToStatus(
  opt: FilterOption
): "ALL" | "ACTIVE" | "UPCOMING" | "COMPLETED" | "ENDED" {
  switch (opt) {
    case "Đang diễn ra":
      return "ACTIVE";
    case "Sắp diễn ra":
      return "UPCOMING";
    case "Hoàn thành":
      return "COMPLETED";
    case "Đã kết thúc":
      return "ENDED";
    case "Tất cả":
    default:
      return "ALL";
  }
}

export default function ContestsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("Tất cả");
  const [showFilters, setShowFilters] = useState(false);

  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const s = styles(scheme);

  // Debounce search gõ phím
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 260);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // NEW: chỉ bật query khi độ dài hợp lệ để tránh spam API
  const canQuery = debouncedQuery.length === 0 || debouncedQuery.length >= 2; // <=2 coi như bỏ qua

  // API
  const { data, isLoading, isFetching, error } = useContest({
    status: mapFilterToStatus(selectedFilter),
    // NEW: nếu BE hỗ trợ query, truyền vào với điều kiện canQuery
    query: canQuery ? debouncedQuery || undefined : undefined,
    // Ngoài ra, nếu hook useContest hỗ trợ options (react-query), nên bật:
    // enabled: canQuery, refetchOnWindowFocus: false, refetchOnReconnect: false
  } as any);

  const contests = useMemo(() => (data ?? []) as any[], [data]);

  // Fallback search client-side
  const filtered = useMemo(() => {
    if (!debouncedQuery) return contests;
    const q = debouncedQuery.toLowerCase();
    return contests.filter((c: any) => {
      const title = (c?.title ?? c?.name ?? "").toLowerCase();
      const subtitle = (c?.subtitle ?? "").toLowerCase();
      return title.includes(q) || subtitle.includes(q);
    });
  }, [contests, debouncedQuery]);

  /* ========== Collapsible header ========== */
  const scrollY = useRef(new Animated.Value(0)).current;
  const [headerHeight, setHeaderHeight] = useState(0);

  const headerOnLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h !== headerHeight) setHeaderHeight(h);
  };

  const clamped = Animated.diffClamp(scrollY, 0, headerHeight || 1);
  const translateY = clamped.interpolate({
    inputRange: [0, Math.max(headerHeight, 1)],
    outputRange: [0, -Math.max(headerHeight, 1)],
    extrapolate: "clamp",
  });
  const progress = clamped.interpolate({
    inputRange: [0, Math.max(headerHeight, 1)],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // NEW: chống spam toggle filter & submit bằng cooldown
  const lastToggleRef = useRef(0);
  const safeToggleFilters = () => {
    const now = Date.now();
    if (now - lastToggleRef.current < 400) return; // cooldown 400ms
    lastToggleRef.current = now;
    setShowFilters((v) => !v);
  };

  const lastSubmitRef = useRef(0);
  const safeSubmit = () => {
    const now = Date.now();
    if (now - lastSubmitRef.current < 500) return; // cooldown 500ms
    lastSubmitRef.current = now;
    // Nếu muốn hành vi submit riêng (ví dụ mở /search) thì đặt ở đây
    // Ở màn này mình chỉ lọc local nên không cần.
  };

  return (
    <View style={s.container}>
      <CollapsibleHeader
        scheme={scheme}
        translateY={translateY}
        progress={progress}
        headerOnLayout={headerOnLayout}
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        showFilters={showFilters}
        onToggleFilters={safeToggleFilters} // NEW: dùng safeToggleFilters
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        filterOptions={filterOptions}
        // Nếu bạn thêm prop onSubmitSearch ở CollapsibleHeader.TextInput => truyền safeSubmit
      />

      {isLoading ? (
        <View style={s.stateWrap}>
          <ActivityIndicator color={C.primary} />
          <Text style={s.stateText}>Đang tải cuộc thi...</Text>
        </View>
      ) : error ? (
        <View style={s.stateWrap}>
          <Text style={[s.stateText, { color: C.destructive ?? "#EF4444" }]}>
            Không tải được dữ liệu. Vui lòng thử lại.
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.stateWrap}>
          <Text style={s.stateText}>Không có cuộc thi phù hợp.</Text>
        </View>
      ) : (
        <Animated.ScrollView
          style={s.list}
          contentContainerStyle={{
            paddingTop: headerHeight,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          // NEW: optional – snap nhẹ để tránh “nhảy” khi dừng cuộn
          onMomentumScrollEnd={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            const threshold = headerHeight * 0.5;
            Animated.spring(scrollY, {
              toValue: y > threshold ? headerHeight : 0,
              useNativeDriver: true,
              speed: 20,
              bounciness: 0,
            }).start();
          }}
        >
          {filtered.map((contest: any, i: number) => (
            <ContestCard
              key={String(contest.contestId ?? contest.id ?? i)}
              contest={contest}
              onPress={() => router.push("/contest-detail")}
            />
          ))}
          {isFetching && (
            <View style={{ paddingVertical: 12, alignItems: "center" }}>
              <ActivityIndicator color={C.mutedForeground} />
            </View>
          )}
        </Animated.ScrollView>
      )}
    </View>
  );
}

const styles = (scheme: "light" | "dark") => {
  const C = Colors[scheme];
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    list: { flex: 1 },
    stateWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: C.background,
      padding: 16,
    },
    stateText: { marginTop: 10, color: C.mutedForeground, fontSize: 16 },
  });
};
