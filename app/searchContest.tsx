// app/search/index.tsx
import { useContest } from "@/apis/contest";
import SearchBar from "@/components/search/SearchBar";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MIN = 2;

/* ---------- Color pools & helpers ---------- */
const POOLS: [string, string][] = [
  ["#FF6B6B", "#FFD166"],
  ["#06B6D4", "#3B82F6"],
  ["#22C55E", "#A3E635"],
  ["#F472B6", "#A78BFA"],
  ["#F59E0B", "#F97316"],
  ["#14B8A6", "#84CC16"],
  ["#60A5FA", "#F472B6"],
  ["#F43F5E", "#FB7185"],
];
const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const pickGrad = (seed = ""): [string, string] =>
  POOLS[hashStr(seed) % POOLS.length];

function normalizeVN(s = "") {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function SearchSuggestionsScreen() {
  const insets = useSafeAreaInsets();
  const HEADER_H = 64 + insets.top;

  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const s = styles(C, insets);

  const [value, setValue] = useState("");
  const [deb, setDeb] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDeb(value.trim()), 220);
    return () => clearTimeout(t);
  }, [value]);

  const canQuery = deb.length >= MIN;

  // BE suggestions (đổi key cho hợp API của bạn nếu khác)
  const { data, isLoading } = useContest({
    suggest: canQuery ? deb : undefined,
  } as any);
  const source = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const suggestions = useMemo(() => {
    if (!canQuery) return [];
    const q = normalizeVN(deb);
    return source
      .map((x: any) => ({
        id: x.id ?? x.contestId ?? x.title,
        title: x.title ?? x.name ?? "",
      }))
      .filter((x: any) => normalizeVN(x.title).includes(q))
      .slice(0, 12);
  }, [source, deb, canQuery]);

  /* ---------- Animated pulsing backdrop ---------- */
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: false,
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

  /* ---------- Header glass content ---------- */
  const ListHeader = (
    <View style={{ marginBottom: 12 }}>
      <View style={s.glassHeader}>
        <View style={s.dotsRow}>
          {Array.from({ length: 5 }).map((_, i) => {
            const [c0] = pickGrad("dot" + i);
            return <View key={i} style={[s.dot, { backgroundColor: c0 }]} />;
          })}
        </View>
        <Text style={s.headerTitle}>Tìm kiếm cuộc thi</Text>
        <Text style={s.headerSub}>Nhập từ khóa để xem gợi ý nhanh</Text>
      </View>
    </View>
  );

  /* ---------- Suggestion Item (gradient pill) ---------- */
  const renderItem = ({ item }: { item: { id: string; title: string } }) => {
    const [c0, c1] = pickGrad(item.title);
    return (
      <Pressable
        onPress={() =>
          router.push({ pathname: "/results", params: { q: item.title } })
        }
        style={({ pressed }) => [
          s.pillWrap,
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        <LinearGradient
          colors={[c0, c1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.pillBorder}
        />
        <View style={[s.pillInner, { backgroundColor: C.card }]}>
          <Text
            numberOfLines={1}
            style={[s.suggestText, { color: C.foreground }]}
          >
            {item.title}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={s.container}>
      {/* Pulsing colorful backdrop + orbs */}
      <Animated.View style={s.backdrop}>
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
        {/* Orbs */}
        <LinearGradient
          colors={["#fda4af55", "#fde68a55"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.orbTL}
        />
        <LinearGradient
          colors={["#93c5fd55", "#a78bfa55"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={s.orbBR}
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
          Gợi ý tìm kiếm
        </Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      {/* SearchBar dưới header */}
      <View style={{ paddingHorizontal: 16, paddingTop: HEADER_H + 12 }}>
        <SearchBar
          scheme={scheme}
          value={value}
          onChangeText={setValue}
          onSubmitSearch={(t) => {
            setValue(t);
            router.push({ pathname: "/results", params: { q: t } });
          }}
          storageKey="@search_history_contests"
          onToggleFilters={() => {}}
        />
      </View>

      {/* Gợi ý */}
      {!canQuery ? (
        <Text style={[s.hint, { paddingHorizontal: 16, marginTop: 12 }]}>
          Nhập ≥ {MIN} ký tự để hiện gợi ý…
        </Text>
      ) : (
        <FlatList
          data={suggestions}
          keyExtractor={(it) => String(it.id)}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: 32,
            paddingHorizontal: 16,
          }}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            !isLoading ? (
              <Text style={s.hint}>Không có gợi ý phù hợp.</Text>
            ) : null
          }
          keyboardShouldPersistTaps="handled"
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
    orbTL: {
      position: "absolute",
      top: 80,
      right: -50,
      width: 220,
      height: 220,
      borderRadius: 140,
      transform: [{ rotate: "18deg" }],
      opacity: 0.9,
    },
    orbBR: {
      position: "absolute",
      bottom: 40,
      left: -60,
      width: 260,
      height: 260,
      borderRadius: 160,
      transform: [{ rotate: "-12deg" }],
      opacity: 0.85,
    },

    // Header
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 64 + insets.top,
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
    headerCaption: {
      color: "#fff",
      fontWeight: "800",
      fontSize: 16,
      letterSpacing: 0.3,
    },

    // Glass block under header
    glassHeader: {
      backgroundColor: C.card,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: C.border,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
    },
    dotsRow: {
      flexDirection: "row",
      gap: 6,
      marginBottom: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      opacity: 0.9,
    },
    headerTitle: {
      color: C.foreground,
      fontSize: 18,
      fontWeight: "800",
    },
    headerSub: {
      marginTop: 6,
      color: C.mutedForeground,
      fontSize: 13,
    },

    // Hint
    hint: { color: C.mutedForeground, fontSize: 14 },

    // Suggestion “bubbles”
    pillWrap: {
      position: "relative",
      borderRadius: 999,
    },
    pillBorder: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      borderRadius: 999,
      opacity: 0.95,
    },
    pillInner: {
      margin: 1.5,
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 10,
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    suggestText: { fontSize: 15, fontWeight: "800", letterSpacing: 0.2 },
  });
