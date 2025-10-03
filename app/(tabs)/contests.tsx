// app/(tabs)/contests.tsx
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useContest } from "@/apis/contest";
import { ContestCard } from "@/components/ContestCard";
import CollapsibleHeader, {
  FilterOption,
} from "@/components/header/contest/CollapsibleHeader";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

/* ======================== Types & helpers ======================== */
type ContestStatus = "ALL" | "ACTIVE" | "UPCOMING" | "COMPLETED" | "ENDED";

const FILTERS: FilterOption[] = [
  "Tất cả",
  "Đang diễn ra",
  "Sắp diễn ra",
  "Đã kết thúc",
  "Hoàn thành",
];

const filterToStatus: Record<FilterOption, ContestStatus> = {
  "Tất cả": "ALL",
  "Đang diễn ra": "ACTIVE",
  "Sắp diễn ra": "UPCOMING",
  "Đã kết thúc": "ENDED",
  "Hoàn thành": "COMPLETED",
};

type Contest = {
  id?: string | number;
  contestId?: string | number;
  title?: string;
  name?: string;
  subtitle?: string;
  // ... các field khác dùng trong ContestCard
};

function useDebouncedValue<T>(value: T, delay = 260) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* ======================== Screen ======================== */
export default function ContestsScreen() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const s = styles(scheme);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("Tất cả");
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const debouncedQuery = useDebouncedValue(searchQuery.trim(), 260);
  const canQuery = debouncedQuery.length === 0 || debouncedQuery.length >= 2;

  // ===== API =====
  const { data, isLoading, isFetching, error, refetch } = useContest({
    status: filterToStatus[selectedFilter],
    query: canQuery ? debouncedQuery || undefined : undefined,
  } as any);

  const contests: Contest[] = useMemo(() => (data ?? []) as Contest[], [data]);

  // Fallback filter client-side nếu BE chưa hỗ trợ subtitle
  const filtered: Contest[] = useMemo(() => {
    if (!debouncedQuery) return contests;
    const q = debouncedQuery.toLowerCase();
    return contests.filter((c) => {
      const title = (c?.title ?? c?.name ?? "").toLowerCase();
      const subtitle = (c?.subtitle ?? "").toLowerCase();
      return title.includes(q) || subtitle.includes(q);
    });
  }, [contests, debouncedQuery]);

  // ===== Collapsible header =====
  const scrollY = useRef(new Animated.Value(0)).current;
  const listRef = useRef<Animated.FlatList<Contest>>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const headerOnLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    setHeaderHeight((prev) => (prev === h ? prev : h));
  }, []);

  const clamped = Animated.diffClamp(scrollY, 0, Math.max(headerHeight, 1));
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

  // Snap header khi momentum kết thúc: scroll list tới offset = headerHeight hoặc 0
  const handleMomentumEnd = useCallback(
    (e: any) => {
      const y = e.nativeEvent.contentOffset.y;
      const threshold = headerHeight * 0.5;
      const target = y > threshold ? headerHeight : 0;
      // Animated.FlatList có scrollToOffset
      listRef.current?.scrollToOffset?.({ offset: target, animated: true });
    },
    [headerHeight]
  );

  // Toggle bộ lọc có cooldown tránh spam
  const lastToggleRef = useRef(0);
  const safeToggleFilters = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleRef.current < 400) return;
    lastToggleRef.current = now;
    setShowFilters((v) => !v);
  }, []);

  const onChangeSearch = useCallback((txt: string) => {
    setSearchQuery(txt);
    listRef.current?.scrollToOffset?.({ offset: 0, animated: false });
  }, []);

  const onSubmitSearch = useCallback(() => {
    listRef.current?.scrollToOffset?.({ offset: 0, animated: true });
  }, []);

  const onChangeFilter = useCallback((opt: FilterOption) => {
    setSelectedFilter(opt);
    listRef.current?.scrollToOffset?.({ offset: 0, animated: true });
  }, []);

  // Đổi filter → refetch (nếu hook hỗ trợ)
  useEffect(() => {
    refetch?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refetch?.();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const keyExtractor = useCallback(
    (c: Contest, i: number) => String(c.contestId ?? c.id ?? i),
    []
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Contest; index: number }) => (
      <ContestCard
        contest={item}
        onPress={() =>
          router.push({
            pathname: "/contest-detail",
            params: { id: String(item.contestId ?? item.id ?? index) },
          })
        }
        // gợi ý: thêm accessibilityRole/Label trong ContestCard
      />
    ),
    []
  );

  /* ======================== UI ======================== */
  return (
    <View style={s.container}>
      <CollapsibleHeader
        scheme={scheme}
        translateY={translateY}
        progress={progress}
        headerOnLayout={headerOnLayout}
        searchQuery={searchQuery}
        onChangeSearch={onChangeSearch}
        onSubmitSearch={onSubmitSearch}
        showFilters={showFilters}
        onToggleFilters={safeToggleFilters}
        selectedFilter={selectedFilter}
        onSelectFilter={onChangeFilter}
        filterOptions={FILTERS}
        // gợi ý: hiển thị hint nếu debouncedQuery.length === 1
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
          <Text style={s.stateText}>
            {debouncedQuery && debouncedQuery.length === 1
              ? "Nhập ≥ 2 ký tự để tìm…"
              : "Không có cuộc thi phù hợp."}
          </Text>
        </View>
      ) : (
        <Animated.FlatList
          ref={listRef}
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingTop: headerHeight, // đẩy nội dung dưới header
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          onMomentumScrollEnd={handleMomentumEnd}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.mutedForeground}
              colors={[C.primary]}
            />
          }
          // Nếu có pagination từ hook:
          // onEndReachedThreshold={0.25}
          // onEndReached={() => fetchNextPage?.()}
          // ListFooterComponent={isFetchingNextPage ? <Spinner/> : null}
        />
      )}

      {/* Fetching indicator nhỏ phía dưới khi refetch background */}
      {isFetching && !isLoading && filtered.length > 0 && (
        <View style={s.fetchingFoot}>
          <ActivityIndicator color={C.mutedForeground} />
        </View>
      )}
    </View>
  );
}

/* ======================== Styles ======================== */
const styles = (scheme: "light" | "dark") => {
  const C = Colors[scheme];
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    stateWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: C.background,
      padding: 16,
    },
    stateText: { marginTop: 10, color: C.mutedForeground, fontSize: 16 },
    fetchingFoot: {
      position: "absolute",
      bottom: 8,
      alignSelf: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: C.card,
    },
  });
};
