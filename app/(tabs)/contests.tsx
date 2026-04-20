import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useWhoAmI } from "@/apis/auth";
import { useContest, useExaminerContest } from "@/apis/contest";
import ArtchainAnimation from "@/components/animations/ArtchainAnimation";
import { ContestCard } from "@/components/cards/ContestCard";
import CollapsibleHeader, {
  FilterOption,
} from "@/components/header/contest/CollapsibleHeader";
import ExaminerContestsPanel from "@/components/panels/ExaminerContestsPanel";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/auth-store";
import { Contest } from "@/types";
import { FlatList } from "react-native-gesture-handler";

/* ======================== Types & helpers ======================== */
type ContestStatus = "ALL" | "UPCOMING" | "ACTIVE" | "ENDED";

const FILTERS: FilterOption[] = [
  "Tất cả",
  "Sắp diễn ra",
  "Đang diễn ra",
  "Đã kết thúc",
];

const filterToStatus: Record<FilterOption, ContestStatus> = {
  "Tất cả": "ALL",
  "Sắp diễn ra": "UPCOMING",
  "Đang diễn ra": "ACTIVE",
  "Đã kết thúc": "ENDED",
};

// Helper to normalize Vietnamese text for search
function normalizeVN(s = "") {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

  const insets = useSafeAreaInsets();
  const TOP_INSET = insets.top ?? 0;

  // ===== Auth & User Info =====
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: user } = useWhoAmI();
  const isExaminer = user?.role === "EXAMINER";

  // ===== API - Normal contests (for non-examiners) =====
  const { data, isPending, error, fetchNextPage, isFetchingNextPage, refetch } =
    useContest({
      status: filterToStatus[selectedFilter],
    });

  // ===== API - Examiner contests (only when user is examiner) =====
  const {
    data: examinerContests,
    isLoading: examinerLoading,
    refetch: refetchExaminer,
  } = useExaminerContest(isExaminer ? user?.userId : undefined);

  // ===== Collapsible header =====
  const isDraggingRef = useRef(false);
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
    [headerHeight],
  );

  const translateY = new Animated.Value(0); // Keep header always visible
  const progress = new Animated.Value(0);

  const lastToggleRef = useRef(0);
  const safeToggleFilters = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleRef.current < 400) return;
    lastToggleRef.current = now;
    setShowFilters((v) => !v);
  }, []);

  const onChangeSearch = useCallback((txt: string) => {
    setSearchQuery(txt);
  }, []);

  const onChangeFilter = useCallback((opt: FilterOption) => {
    setSelectedFilter(opt);
  }, []);

  const lastRefreshRef = useRef(0); // Debounce ref to prevent rapid refresh calls

  const onRefresh = useCallback(async () => {
    try {
      // Debounce: prevent multiple refresh calls within 500ms
      const now = Date.now();
      if (now - lastRefreshRef.current < 500) return;
      lastRefreshRef.current = now;

      setRefreshing(true);
      if (isExaminer) {
        await refetchExaminer();
      } else {
        await refetch();
      }
    } finally {
      setRefreshing(false);
    }
  }, [refetch, refetchExaminer, isExaminer]);

  const onEndReached = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  // Filter contests based on search query
  const allContests = data?.pages?.flatMap((page) => page?.data ?? []) ?? [];
  const filteredContests = useMemo(() => {
    if (!searchQuery.trim()) return allContests;
    const q = normalizeVN(searchQuery);
    return allContests.filter((contest) =>
      normalizeVN(contest.title ?? "").includes(q),
    );
  }, [allContests, searchQuery]);

  const keyExtractor = useCallback(
    (c: Contest, i: number) => String(c.contestId ?? i),
    [],
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
    [],
  );

  const listFooterComponent = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={s.footerLoading}>
          <ArtchainAnimation />
          <Text style={s.footerText}>Đang tải thêm cuộc thi...</Text>
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage, C, s]);

  const listEmptyComponent = useCallback(() => {
    if (isPending) return null; // Don't show empty state while loading
    return (
      <View style={s.emptyWrap}>
        <Text style={s.emptyTitle}>Không có cuộc thi nào</Text>
        <Text style={s.emptySubtitle}>
          Hiện tại chưa có cuộc thi nào phù hợp với bộ lọc của bạn.
        </Text>
      </View>
    );
  }, [isPending, s]);

  /* ======================== UI ======================== */

  // If user is examiner, show examiner contests panel instead
  if (isExaminer) {
    return (
      <View style={s.screen}>
        <ExaminerContestsPanel C={C} userId={user?.userId} vertical={true} />
      </View>
    );
  }

  // Normal UI for non-examiner users
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
        showFilters={showFilters}
        onToggleFilters={safeToggleFilters}
        selectedFilter={selectedFilter}
        onSelectFilter={onChangeFilter}
        filterOptions={FILTERS}
        topInset={TOP_INSET}
      />

      {isPending ? (
        <View style={s.stateWrap}>
          <ArtchainAnimation />
          <Text style={s.stateText}>Đang tải cuộc thi...</Text>
        </View>
      ) : error ? (
        <View style={s.stateWrap}>
          <Text style={[s.stateText, { color: C.destructive ?? "#EF4444" }]}>
            Không tải được dữ liệu. Vui lòng thử lại.
          </Text>
          <Pressable
            onPress={onRefresh}
            style={({ pressed }) => [
              s.retryButton,
              {
                backgroundColor: C.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[s.retryButtonText, { color: "#fff" }]}>Thử lại</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredContests}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingTop: TOP_PADDING,
            paddingBottom: 24,
            paddingHorizontal: 6,
          }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
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
              progressViewOffset={TOP_PADDING}
              progressBackgroundColor={C.card}
            />
          }
          ListFooterComponent={listFooterComponent}
          ListEmptyComponent={listEmptyComponent}
        />
      )}

      {/* Footer loading indicator */}
      {isFetchingNextPage && !isPending && (
        <View style={s.fetchingFoot}>
          <ArtchainAnimation />
          <Text style={[s.footerText, { marginLeft: 8 }]}>
            Đang tải thêm...
          </Text>
        </View>
      )}
    </View>
  );
}

/* ======================== Styles ======================== */
const styles = (scheme: "light" | "dark") => {
  const C = Colors[scheme];
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.newbackground, paddingBottom: 32 },
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
    footerLoading: {
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    footerText: {
      marginTop: 8,
      color: C.mutedForeground,
      fontSize: 14,
    },
    emptyWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 100,
      paddingHorizontal: 24,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: C.foreground,
      textAlign: "center",
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: C.mutedForeground,
      textAlign: "center",
      lineHeight: 20,
    },
    retryButton: {
      marginTop: 16,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    retryButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
  });
};
