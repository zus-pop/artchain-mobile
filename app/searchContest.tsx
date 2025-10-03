import { useContest } from "@/apis/contest";
import { ContestCard } from "@/components/ContestCard";
import SearchBar from "@/components/search/SearchBar";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const MIN_QUERY_CHARS = 2;

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [value, setValue] = useState((q ?? "").toString());
  const [debounced, setDebounced] = useState(value);

  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const s = styles(C);

  // Accent pulse (đổi màu → JS driver vì animation màu)
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 4500,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const pulseBg = pulse.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [
      C.primary,
      C.chart2 || "#22C55E",
      C.chart3 || "#3B82F6",
      C.primary,
    ],
  });

  // Debounce input -> query API
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value.trim()), 300);
    return () => clearTimeout(t);
  }, [value]);

  // Chỉ query khi rỗng hoặc đủ dài
  const canQuery =
    debounced.length === 0 || debounced.length >= MIN_QUERY_CHARS;

  // API search (BE support ?query=) — truyền query có điều kiện để tránh spam
  const { data, isLoading, isFetching } = useContest({
    status: "ALL",
    query: canQuery ? debounced || undefined : undefined,
  });

  const source = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  // Fallback filter client-side nếu BE chưa hỗ trợ query
  const results = useMemo(() => {
    if (!debounced) return source;
    const ql = debounced.toLowerCase();
    return source.filter((c: any) => {
      const title = (c?.title ?? c?.name ?? "").toLowerCase();
      const subtitle = (c?.subtitle ?? "").toLowerCase();
      return title.includes(ql) || subtitle.includes(ql);
    });
  }, [source, debounced]);

  return (
    <View style={s.container}>
      {/* Header + SearchBar */}
      <View style={s.headerWrap}>
        <Animated.View style={[s.headerAccent, { backgroundColor: pulseBg }]} />
        <View style={{ paddingHorizontal: 16 }}>
          <SearchBar
            scheme={scheme}
            value={value}
            onChangeText={setValue}
            onToggleFilters={() => {
              /* nếu cần mở panel filter thì handle ở đây */
            }}
            onSubmitSearch={(t) => setValue(t)} // đẩy t vào state -> trigger debounce
            storageKey="@search_history_contests"
          />
        </View>
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={s.stateWrap}>
          <ActivityIndicator color={C.primary} />
          <Text style={s.stateText}>Đang tìm kiếm...</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={s.stateWrap}>
          <Text style={s.stateText}>
            {canQuery
              ? "Không tìm thấy cuộc thi phù hợp."
              : `Nhập ít nhất ${MIN_QUERY_CHARS} ký tự để tìm kiếm.`}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingTop: 8,
            paddingBottom: 28,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {results.map((contest: any, idx: number) => (
            <View
              key={String(contest.contestId ?? contest.id ?? idx)}
              style={{ marginBottom: 12 }}
            >
              <ContestCard
                contest={contest}
                onPress={() => {
                  /* điều hướng nếu cần */
                }}
              />
            </View>
          ))}

          {isFetching && (
            <View style={{ paddingVertical: 12, alignItems: "center" }}>
              <ActivityIndicator color={C.mutedForeground} />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = (C: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    headerWrap: { paddingTop: 48, paddingBottom: 12, marginBottom: 6 },
    headerAccent: { ...StyleSheet.absoluteFillObject, opacity: 0.18 },
    stateWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },
    stateText: { marginTop: 10, color: C.mutedForeground, fontSize: 16 },
  });
