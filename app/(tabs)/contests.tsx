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
import { Contest } from "@/types";
import { FlatList } from "react-native-gesture-handler";

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

  // ===== API =====
  const { data, isPending, error, fetchNextPage, isFetchingNextPage, refetch } =
    useContest({
      status: filterToStatus[selectedFilter],
    });

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
    [headerHeight]
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

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const onEndReached = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

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

  const listFooterComponent = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={s.footerLoading}>
          <ActivityIndicator color={C.primary} size="large" />
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
          <ActivityIndicator color={C.primary} />
          <Text style={s.stateText}>Đang tải cuộc thi...</Text>
        </View>
      ) : error ? (
        <View style={s.stateWrap}>
          <Text style={[s.stateText, { color: C.destructive ?? "#EF4444" }]}>
            Không tải được dữ liệu. Vui lòng thử lại.
          </Text>
        </View>
      ) : (
        <FlatList
          data={data?.pages.map((page) => page.data).flat()}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingTop: TOP_PADDING,
            paddingBottom: 24,
            paddingHorizontal: 6,
          }}
          showsVerticalScrollIndicator={false}
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
            />
          }
          ListFooterComponent={listFooterComponent}
          ListEmptyComponent={listEmptyComponent}
        />
      )}

      {/* Footer loading indicator */}
      {isFetchingNextPage && !isPending && (
        <View style={s.fetchingFoot}>
          <ActivityIndicator color={C.primary} size="small" />
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
  });
};
