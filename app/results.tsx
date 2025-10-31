import { useContest } from "@/apis/contest";
import { ContestCard } from "@/components/cards/ContestCard";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Filter } from "lucide-react-native";
import React, { useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MIN_QUERY_CHARS = 2;

function normalizeVN(s = "") {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function SearchResultsScreen() {
  const insets = useSafeAreaInsets();
  const HEADER_H = 64 + insets.top;

  const { q } = useLocalSearchParams<{ q?: string }>();
  const queryRaw = (q ?? "").toString();
  const query = queryRaw.trim();

  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const s = styles(C, insets);

  // ===== Gradient pulse (header & backdrop) =====
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: false, // animate colors
      })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const g1 = pulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [C.primary, C.chart2 ?? "#22c55e", C.primary],
  });
  const g2 = pulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      C.chart1 ?? "#8b5cf6",
      C.chart3 ?? "#3b82f6",
      C.chart1 ?? "#8b5cf6",
    ],
  });

  // ===== Query control =====
  const canQuery = query.length === 0 || query.length >= MIN_QUERY_CHARS;

  const params: any = {
    // status: "ALL", // bật nếu BE hỗ trợ; nếu không thì để trống
    query: canQuery ? query || undefined : undefined, // đổi key -> keyword/q nếu BE cần
  };

  const { data, isLoading, isFetching, error } = useContest(params, {
    enabled: canQuery,
  } as any);

  const source = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const results = useMemo(() => {
    if (!query) return source;
    const qn = normalizeVN(query);
    return source.filter((c: any) => {
      const t = normalizeVN(c?.title ?? c?.name ?? "");
      const s2 = normalizeVN(c?.subtitle ?? "");
      return t.includes(qn) || s2.includes(qn);
    });
  }, [source, query]);

  // ===== List header (glass + stats) =====
  const ListHeader = (
    <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
      <View style={s.glassHeader}>
        <Text style={s.headerTitle} numberOfLines={2}>
          Kết quả cho <Text style={s.headerQuery}>“{queryRaw}”</Text>
        </Text>
        <View style={s.countPill}>
          <Text style={s.countText}>
            {isLoading ? "…" : `${results.length} kết quả`}
          </Text>
        </View>
      </View>
    </View>
  );

  // ===== Skeleton when loading =====
  const Skeleton = () => (
    <View style={{ padding: 16, gap: 12 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={s.skelCard}>
          <Animated.View
            style={[
              s.skelShimmer,
              {
                backgroundColor: g2 as any,
                opacity: 0.12,
              },
            ]}
          />
          <View style={s.skelLineWide} />
          <View style={s.skelLineMid} />
          <View style={s.skelLineShort} />
        </View>
      ))}
    </View>
  );

  // ===== Empty state =====
  const Empty = (
    <View style={s.center}>
      <LinearGradient
        colors={[C.chart1 ?? "#8b5cf6", C.chart3 ?? "#3b82f6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.emptyBadge}
      >
        <Text style={s.emptyEmoji}>🔎</Text>
      </LinearGradient>
      <Text style={s.emptyTextTop}>Không có kết quả</Text>
      <Text style={s.emptyTextSub}>
        Thử từ khóa khác hoặc rút gọn bộ lọc nhé.
      </Text>
    </View>
  );

  // ===== Render =====
  return (
    <View style={s.container}>
      {/* Pulsing colorful backdrop */}
      <Animated.View style={[s.backdrop]}>
        <LinearGradient
          colors={["transparent", "transparent"]}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: g1 as any, opacity: 0.12 },
          ]}
        />
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: g2 as any, opacity: 0.12 },
          ]}
        />
      </Animated.View>

      {/* Sticky colorful header */}
      <LinearGradient
        colors={[C.primary, C.chart3 ?? "#3b82f6", C.chart1 ?? "#8b5cf6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [s.iconBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <ChevronLeft size={20} color="#fff" />
        </Pressable>

        <Text numberOfLines={1} style={s.headerCaption}>
          Kết quả tìm kiếm
        </Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      {/* Floating filter button (demo) */}
      <Pressable
        onPress={() => {}}
        style={({ pressed }) => [
          s.fab,
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Bộ lọc"
      >
        <LinearGradient
          colors={[C.chart2 ?? "#22c55e", C.chart3 ?? "#3b82f6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.fabGrad}
        >
          <Filter size={18} color="#fff" />
        </LinearGradient>
      </Pressable>

      {/* Content */}
      {isLoading ? (
        <Skeleton />
      ) : error ? (
        <View style={s.center}>
          <Text style={[s.hint, { color: C.destructive ?? "#ef4444" }]}>
            Không tải được dữ liệu
            {(error as any)?.message ? `: ${(error as any).message}` : "."}
          </Text>
        </View>
      ) : !canQuery ? (
        <View style={s.center}>
          <Text style={s.hint}>
            Nhập ít nhất {MIN_QUERY_CHARS} ký tự để tìm kiếm.
          </Text>
        </View>
      ) : results.length === 0 ? (
        Empty
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item: any, i) =>
            String(item.contestId ?? item.id ?? i)
          }
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{
            paddingTop: HEADER_H + 12,
            paddingBottom: 48,
          }}
          renderItem={({ item }) => (
            <View style={s.cardWrap}>
              {/* Glass wrap cho card */}
              <View style={s.glassCard}>
                <ContestCard
                  contest={item}
                  onPress={() =>
                    router.push({
                      pathname: "/contest-detail",
                      params: { id: String(item.contestId ?? item.id) },
                    })
                  }
                />
              </View>
            </View>
          )}
          ListFooterComponent={
            isFetching ? (
              <View style={{ paddingVertical: 12, alignItems: "center" }}>
                <ActivityIndicator color={C.mutedForeground} />
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = (C: any, insets: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    backdrop: { ...StyleSheet.absoluteFillObject },
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 64 + insets.top, // +++ dùng HEIGHT tính theo safe area
      paddingHorizontal: 12,
      paddingTop: insets.top + 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 10,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.18)",
    },
    headerCaption: { color: "#fff", fontWeight: "700", fontSize: 16 },
    fab: {
      position: "absolute",
      right: 16,
      bottom: 24,
      zIndex: 5,
      width: 56,
      height: 56,
      borderRadius: 28,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
    fabGrad: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    // Glassy header block
    glassHeader: {
      backgroundColor: "rgba(255,255,255,0.14)",
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.22)",
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
    },
    headerTitle: {
      color: C.foreground,
      fontSize: 18,
      fontWeight: "700",
      marginRight: 12,
    },
    headerQuery: {
      color: C.primary,
    },
    countPill: {
      alignSelf: "flex-start",
      marginTop: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.22)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.28)",
    },
    countText: { color: C.mutedForeground, fontSize: 12, fontWeight: "600" },

    // Card wrap with glass
    cardWrap: { paddingHorizontal: 16 }, // push under header curve
    glassCard: {
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: 8,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.16)",
    },

    // States
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 72,
    },
    hint: { marginTop: 8, color: C.mutedForeground },

    // Empty badge
    emptyBadge: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
      opacity: 0.9,
    },
    emptyEmoji: { fontSize: 40 },
    emptyTextTop: { color: C.foreground, fontSize: 20, fontWeight: "700" },
    emptyTextSub: { color: C.mutedForeground, marginTop: 6 },

    // Skeletons
    skelCard: {
      overflow: "hidden",
      backgroundColor: "rgba(255,255,255,0.06)",
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
    },
    skelShimmer: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    skelLineWide: {
      height: 14,
      borderRadius: 7,
      backgroundColor: "rgba(255,255,255,0.18)",
      marginBottom: 10,
    },
    skelLineMid: {
      width: "70%",
      height: 12,
      borderRadius: 6,
      backgroundColor: "rgba(255,255,255,0.14)",
      marginBottom: 10,
    },
    skelLineShort: {
      width: "45%",
      height: 12,
      borderRadius: 6,
      backgroundColor: "rgba(255,255,255,0.12)",
    },
  });
