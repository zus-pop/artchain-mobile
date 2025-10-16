// app/(tabs)/contests.tsx
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  LayoutChangeEvent,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useContest } from "@/apis/contest";
// import { ContestCard } from "@/components/ContestCard"; // ❌ bỏ
import ContestGridCard from "@/components/cards/ContestGridCard"; // ✅ dùng grid
import CollapsibleHeader, {
  FilterOption,
} from "@/components/header/contest/CollapsibleHeader";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Contest } from "../../types";
import { ContestCard } from "@/components/cards/ContestCard";

/* ---------- BG image (đổi đường dẫn nếu cần) ---------- */
const BG_IMAGE = require("@/assets/images/bg/contestBanner2.jpg");

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

  // Chỉ nhả header khi kéo gần sát đỉnh
  const REVEAL_DISTANCE = 48; // px
  const EPS = 4;
  const snappingRef = useRef(false);

  // ===== API =====
  const {
    data: contests = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useContest({
    status: filterToStatus[selectedFilter],
    // query: debouncedQuery.length === 0 || debouncedQuery.length >= 2 ? debouncedQuery || undefined : undefined,
  });

  // ===== Collapsible header =====
  const scrollY = useRef(new Animated.Value(0)).current;
  const listRef = useRef<Animated.FlatList<Contest>>(null);

  const isDraggingRef = useRef(false);
  const [headerHeight, setHeaderHeight] = useState(0);
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

  const handleRevealNearTop = useCallback(
    (e: any) => {
      if (snappingRef.current) return;
      const H = headerHeight;
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

  // Toggle bộ lọc (cooldown)
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
  return (
    <ImageBackground source={BG_IMAGE} style={s.bg} resizeMode="cover">
      {/* overlay gradient để text/card nổi bật hơn */}
      <LinearGradient
        style={StyleSheet.absoluteFill}
        colors={[
          "rgba(5,10,18,0.20)",
          "rgba(5,10,18,0.30)",
          "rgba(5,10,18,0.20)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

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
              paddingTop: headerHeight + HEADER_EXTRA_GAP,
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
              {
                useNativeDriver: true,
              }
            )}
            onScrollEndDrag={(e) => {
              isDraggingRef.current = false;
              handleRevealNearTop(e);
            }}
            onMomentumScrollEnd={(e) => {
              isDraggingRef.current = false;
              handleRevealNearTop(e);
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
    </ImageBackground>
  );
}

/* ======================== Styles ======================== */
const styles = (scheme: "light" | "dark") => {
  const C = Colors[scheme];
  return StyleSheet.create({
    bg: { flex: 1 }, // ImageBackground
    container: { flex: 1, backgroundColor: "transparent" }, // để lộ BG
    stateWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
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
