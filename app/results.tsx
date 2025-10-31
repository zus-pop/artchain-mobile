// app/results.tsx
import { useContest } from "@/apis/contest";
import AppHeader from "@/components/AppHeader";
import { ContestCard } from "@/components/cards/ContestCard";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

const MIN_QUERY_CHARS = 2;
const BRAND = "#dc5a54";

// -------- helpers
function normalizeVN(s = "") {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
function resolveContestId(x: any) {
  return x?.contestId ?? x?.id ?? x?._id ?? x?.slug ?? x?.code ?? null;
}

export default function SearchResultsScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const queryRaw = (q ?? "").toString();
  const query = queryRaw.trim();

  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const s = styles(C);

  const canQuery = query.length === 0 || query.length >= MIN_QUERY_CHARS;

  // NOTE: useContest chỉ 1 tham số
  const params: any = { query: canQuery ? query || undefined : undefined };
  const { data, isLoading, isFetching, error } = useContest(params as any);

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

  const ListHeader = (
    <View style={s.block}>
      <Text style={s.blockTitle} numberOfLines={2}>
        Kết quả cho <Text style={{ color: BRAND }}>“{queryRaw}”</Text>
      </Text>
      <View style={s.countPill}>
        <Text style={s.countText}>
          {isLoading ? "…" : `${results.length} kết quả`}
        </Text>
      </View>
    </View>
  );

  const Empty = (
    <View style={s.emptyWrap}>
      <Text style={s.emptyTop}>Không có kết quả</Text>
      <Text style={s.emptySub}>Hãy thử từ khóa khác.</Text>
    </View>
  );

  return (
    <View style={s.container}>
      <AppHeader
        title="Kết quả tìm kiếm"
        backgroundColor={BRAND}
        onBack={() => router.back()}
        borderBottom
      />

      {isLoading ? (
        <View style={{ padding: 16, gap: 10 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={s.skelCard}>
              <View style={s.skelLineWide} />
              <View style={s.skelLineMid} />
              <View style={s.skelLineShort} />
            </View>
          ))}
        </View>
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
            Nhập ít nhất {MIN_QUERY_CHARS} ký tự để tìm.
          </Text>
        </View>
      ) : results.length === 0 ? (
        Empty
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item: any, i) => String(resolveContestId(item) ?? i)}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 28 }}
          renderItem={({ item }) => {
            const id = resolveContestId(item);
            return (
              <View style={s.cardWrap}>
                <View style={s.cardBox}>
                  <ContestCard
                    contest={item}
                    onPress={() => {
                      if (!id) return;
                      router.push({
                        pathname: "/contest-detail",
                        params: { contestId: String(id) },
                      });
                    }}
                  />
                </View>
              </View>
            );
          }}
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

const styles = (C: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    // Header block
    block: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: C.border,
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 12,
    },
    blockTitle: {
      color: C.foreground,
      fontSize: 16,
      fontWeight: "700",
    },
    countPill: {
      alignSelf: "flex-start",
      marginTop: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: "rgba(220,90,84,0.10)",
      borderWidth: 1,
      borderColor: BRAND,
    },
    countText: { color: BRAND, fontSize: 12, fontWeight: "700" },

    // Card container
    cardWrap: { paddingHorizontal: 16, marginBottom: 10 },
    cardBox: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 8,
      borderColor: C.border,
      borderWidth: 1,
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },

    // States
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    hint: { color: C.mutedForeground, fontSize: 14 },

    // Empty
    emptyWrap: { alignItems: "center", paddingHorizontal: 16, paddingTop: 24 },
    emptyTop: { color: C.foreground, fontSize: 18, fontWeight: "700" },
    emptySub: { color: C.mutedForeground, marginTop: 6 },

    // Skeleton
    skelCard: {
      backgroundColor: "rgba(0,0,0,0.03)",
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.06)",
    },
    skelLineWide: {
      height: 14,
      borderRadius: 7,
      backgroundColor: "rgba(0,0,0,0.07)",
      marginBottom: 8,
    },
    skelLineMid: {
      width: "70%",
      height: 12,
      borderRadius: 6,
      backgroundColor: "rgba(0,0,0,0.06)",
      marginBottom: 8,
    },
    skelLineShort: {
      width: "45%",
      height: 12,
      borderRadius: 6,
      backgroundColor: "rgba(0,0,0,0.05)",
    },
  });
