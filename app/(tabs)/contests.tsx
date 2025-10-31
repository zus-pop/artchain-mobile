// app/(tabs)/contests.tsx
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useContest } from "@/apis/contest";
import { ContestCard } from "@/components/cards/ContestCard";
import CollapsibleHeader, {
  FilterOption,
} from "@/components/header/contest/CollapsibleHeader";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Contest } from "../../types";

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

function useDebouncedValue<T>(value: T, delay = 260) {
  const [v, setV] = useState(value);
  React.useEffect(() => {
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
  const insets = useSafeAreaInsets();
  const TOP_INSET = insets.top ?? 0;

  // ===== API =====
  const {
    data: contests = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useContest({
    status: filterToStatus[selectedFilter],
  });

  // ===== Collapsible header =====
  const scrollY = useRef(new Animated.Value(0)).current;
  const listRef = useRef<Animated.FlatList<Contest>>(null);

  const isDraggingRef = useRef(false);
  // Dự phòng chiều cao header để iOS không “ăn” mất UI lúc đầu
  const ESTIMATED_HEADER = 96;
  const [headerHeight, setHeaderHeight] = useState(ESTIMATED_HEADER);
  const HEADER_EXTRA_GAP = 12;

  const headerOnLayout = useCallback(
    (e: LayoutChangeEvent) => {
      if (isDraggingRef.current) return;
      const h = e.nativeEvent.layout.height;
      if (h > 0 && Math.abs(h - headerHeight) > 1) {
        setHeaderHeight(h);
      }
    },
    [headerHeight]
  );

  const clampMax = Math.max(headerHeight, 1);
  const clamped = Animated.diffClamp(scrollY, 0, clampMax);

  const translateY = clamped.interpolate({
    inputRange: [0, clampMax],
    outputRange: [0, -clampMax],
    extrapolate: "clamp",
  });

  const progress = clamped.interpolate({
    inputRange: [0, clampMax],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const REVEAL_DISTANCE = 48;
  const EPS = 4;
  const snappingRef = useRef(false);
  const handleRevealNearTop = useCallback(
    (e: any) => {
      if (snappingRef.current) return;
      const H = headerHeight; // độ cao header thực tế
      if (H <= 0) return;
      const y: number = e?.nativeEvent?.contentOffset?.y ?? 0;

      if (Math.abs(y - 0) <= EPS || Math.abs(y - H) <= EPS) return;

      if (y <= REVEAL_DISTANCE) {
        snappingRef.current = true;
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
        setTimeout(() => (snappingRef.current = false), 250);
        return;
      }
      if (y < H) {
        snappingRef.current = true;
        listRef.current?.scrollToOffset({ offset: H, animated: true });
        setTimeout(() => (snappingRef.current = false), 250);
      }
    },
    [headerHeight]
  );

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

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refetch?.();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const keyExtractor = useCallback(
    (c: Contest, i: number) => String(c.contestId ?? i),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: Contest }) => (
      <View style={{ flex: 1, paddingHorizontal: 6, marginBottom: 12 }}>
        <ContestCard
          contest={item}
          onPress={() => {
            router.push({
              pathname: "/contest-detail",
              params: { contestId: item.contestId },
            });
          }}
        />
      </View>
    ),
    []
  );

  /* ======================== UI ======================== */
  const TOP_PADDING = headerHeight + HEADER_EXTRA_GAP + TOP_INSET;

  return (
    <View style={s.screen}>
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
        topInset={TOP_INSET}
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
      ) : contests.length === 0 ? (
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
          data={contests}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingTop: TOP_PADDING,
            paddingBottom: 24,
            paddingHorizontal: 6,
          }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScrollBeginDrag={() => {
            isDraggingRef.current = true;
          }}
          onMomentumScrollBegin={() => {
            isDraggingRef.current = true;
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          onScrollEndDrag={(e) => {
            isDraggingRef.current = false;
            handleRevealNearTop(e);
          }}
          onMomentumScrollEnd={(e) => {
            isDraggingRef.current = false;
            handleRevealNearTop(e);
          }}
          // iOS: tự kiểm soát inset để không mất UI khúc đầu
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false as any}
          scrollIndicatorInsets={{
            top: TOP_PADDING,
            bottom: 24,
            left: 0,
            right: 0,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.mutedForeground}
              colors={[C.primary]}
            />
          }
        />
      )}

      {isFetching && !isLoading && contests.length > 0 && (
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
    screen: { flex: 1, backgroundColor: C.background, paddingBottom: 32 },
    stateWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
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
