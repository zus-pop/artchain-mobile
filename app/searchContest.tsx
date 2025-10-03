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

  // Gợi ý từ BE (nhẹ). Nếu BE không có 'suggest', đổi key phù hợp.
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
      .slice(0, 8);
  }, [source, deb, canQuery]);

  // Backdrop pulsing (rực rỡ)
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 5000,
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

  const ListHeader = (
    <View style={{ marginBottom: 12 }}>
      <View style={s.glassHeader}>
        <Text style={s.headerTitle}>Tìm kiếm cuộc thi</Text>
        <Text style={s.headerSub}>Nhập từ khóa để xem gợi ý nhanh</Text>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      {/* Pulsing colorful backdrop */}
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
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({ pathname: "/results", params: { q: item.title } })
              }
              style={({ pressed }) => [
                s.suggestItem,
                pressed && { opacity: 0.72 },
              ]}
            >
              <Text numberOfLines={1} style={s.suggestText}>
                {item.title}
              </Text>
            </Pressable>
          )}
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
    headerCaption: { color: "#fff", fontWeight: "700", fontSize: 16 },

    // Glass block under header
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
    },
    headerSub: {
      marginTop: 6,
      color: C.mutedForeground,
      fontSize: 13,
    },

    // Suggestions
    hint: { color: C.mutedForeground, fontSize: 14 },
    suggestItem: {
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    suggestText: { color: C.foreground, fontSize: 16 },
  });
