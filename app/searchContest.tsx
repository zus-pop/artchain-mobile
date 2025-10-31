// app/searchContest.tsx
import { useContest } from "@/apis/contest";
import SearchBar from "@/components/search/SearchBar";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  Pencil,
  PlayCircle,
  Trophy,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type FlexAlignType,
  type PressableStateCallbackType,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MIN = 2;
const BRAND = {
  base: "#DC5A54",
  a08: "rgba(220,90,84,0.08)",
  a12: "rgba(220,90,84,0.12)",
} as const;

function normalizeVN(s = "") {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
const fmtVN = (d?: string) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "";

const statusMeta = (s?: string) => {
  const k = String(s ?? "").toUpperCase();
  switch (k) {
    case "ACTIVE":
      return {
        text: "Đang diễn ra",
        color: "#0EA5E9",
        Icon: PlayCircle as any,
      };
    case "UPCOMING":
      return {
        text: "Sắp diễn ra",
        color: "#D97706",
        Icon: CalendarClock as any,
      };
    case "COMPLETED":
      return {
        text: "Hoàn thành",
        color: "#16A34A",
        Icon: CheckCircle2 as any,
      };
    case "ENDED":
      return {
        text: "Đã kết thúc",
        color: "#64748B",
        Icon: CircleSlash as any,
      };
    case "DRAFT":
      return { text: "Nháp", color: "#94A3B8", Icon: Pencil as any };
    default:
      return { text: s || "—", color: "#64748B", Icon: CircleSlash as any };
  }
};

export default function SearchContestScreen() {
  const insets = useSafeAreaInsets();
  const HEADER_H = 56 + insets.top;

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

  const { data, isLoading } = useContest({
    suggest: canQuery ? deb : undefined,
  } as any);
  const source = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const suggestions = useMemo(() => {
    if (!canQuery) return [];
    const q = normalizeVN(deb);
    return source
      .filter((x: any) => normalizeVN(x.title ?? x.name ?? "").includes(q))
      .slice(0, 12)
      .map((x: any) => ({
        id: String(x.id ?? x.contestId ?? x.title),
        contest: x,
      }));
  }, [source, deb, canQuery]);

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, {
      toValue: canQuery ? 0 : 1,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [canQuery, fade]);

  const HeaderBar = (
    <View style={[s.header, { backgroundColor: BRAND.base }]}>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          s.iconBtn,
          pressed ? { opacity: 0.7 } : undefined,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
      >
        <ChevronLeft size={20} color="#fff" />
      </Pressable>
      <Text numberOfLines={1} style={s.headerTitle}>
        Gợi ý tìm kiếm
      </Text>
      <View style={{ width: 36 }} />
    </View>
  );

  const renderItem = ({ item }: { item: { id: string; contest: any } }) => (
    <HorizontalContestItem
      key={item.id}
      C={C}
      data={item.contest}
      onPress={() =>
        router.push({ pathname: "/results", params: { q: item.contest.title } })
      }
    />
  );

  return (
    <View style={s.container}>
      {HeaderBar}

      <View style={{ paddingHorizontal: 16, paddingTop: HEADER_H + 10 }}>
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

      {!canQuery ? (
        <Animated.Text
          style={[
            s.hint,
            {
              paddingHorizontal: 16,
              marginTop: 12,
              transform: [
                {
                  translateY: fade.interpolate({
                    inputRange: [0, 1],
                    outputRange: [6, 0],
                  }),
                },
              ],
              opacity: fade,
            },
          ]}
        >
          Nhập ≥ {MIN} ký tự để hiện gợi ý…
        </Animated.Text>
      ) : (
        <FlatList
          data={suggestions}
          keyExtractor={(it) => it.id}
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

/* -------- Horizontal contest card (compact, không chồng chéo) -------- */
function HorizontalContestItem({
  data,
  C,
  onPress,
}: {
  data: any;
  C: any;
  onPress: () => void;
}) {
  const cover =
    data?.bannerUrl ||
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop";

  const start = fmtVN(data?.startDate);
  const end = fmtVN(data?.endDate);
  const { text, color, Icon } = statusMeta(data?.status);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: BRAND.a12 }}
      style={pressableItemStyle(C)}
    >
      {/* LEFT: cover */}
      <Image source={{ uri: cover }} style={itemStyles.cover} />

      {/* CENTER: content */}
      <View style={itemStyles.content}>
        <Text numberOfLines={2} style={itemStyles.title(C)}>
          {data?.title || "Cuộc thi"}
        </Text>

        <View style={itemStyles.metaBlock}>
          <View style={itemStyles.row}>
            <CalendarDays size={16} color={C.mutedForeground} />
            <Text numberOfLines={1} style={itemStyles.metaText(C)}>
              {start && end ? `${start} - ${end}` : end || "—"}
            </Text>
          </View>

          <View style={itemStyles.row}>
            <Trophy size={16} color={C.mutedForeground} />
            <Text numberOfLines={1} style={itemStyles.metaText(C)}>
              {data?.numOfAward ?? 0} giải
            </Text>
          </View>
        </View>

        <View
          style={[
            itemStyles.statusPill,
            { backgroundColor: `${color}1A`, borderColor: `${color}66` },
          ]}
        >
          <Icon size={14} color={color} />
          <Text numberOfLines={1} style={[itemStyles.statusText, { color }]}>
            {text}
          </Text>
        </View>
      </View>

      {/* RIGHT: chevron */}
      <View style={itemStyles.chevron}>
        <ChevronRight size={20} color={C.mutedForeground} />
      </View>
    </Pressable>
  );
}

/* ---- Style helpers (typed) ---- */
const pressableItemStyle =
  (C: any) =>
  ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> =>
    [
      itemStyles.card(C),
      pressed ? { opacity: 0.96, transform: [{ scale: 0.995 }] } : undefined,
    ] as StyleProp<ViewStyle>;

const itemStyles = {
  card: (C: any): ViewStyle => ({
    flexDirection: "row",
    alignItems: "center" as FlexAlignType,
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 10,
    gap: 10,
    minHeight: 90,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  }),
  cover: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: "#eee",
  } as ViewStyle,
  content: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  } as ViewStyle,
  title: (C: any): TextStyle => ({
    color: C.foreground,
    fontSize: 15.5,
    fontWeight: "800" as TextStyle["fontWeight"],
    lineHeight: 20,
  }),
  metaBlock: { gap: 4 } as ViewStyle,
  row: {
    flexDirection: "row",
    alignItems: "center" as FlexAlignType,
    gap: 6,
  } as ViewStyle,
  metaText: (C: any): TextStyle => ({
    color: C.mutedForeground,
    fontSize: 13.5,
    flexShrink: 1,
  }),
  statusPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center" as FlexAlignType,
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 4,
  } as ViewStyle,
  statusText: {
    fontSize: 12.5,
    fontWeight: "800" as TextStyle["fontWeight"],
    maxWidth: 230,
  } as TextStyle,
  chevron: {
    justifyContent: "center",
    alignItems: "center" as FlexAlignType,
    paddingLeft: 2,
    paddingRight: 2,
  } as ViewStyle,
};

/* -------------------- Screen styles -------------------- */
const styles = (C: any, insets: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 56 + insets.top,
      paddingTop: insets.top + 12,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 10,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.18)",
    },
    headerTitle: {
      color: "#fff",
      fontWeight: "800" as TextStyle["fontWeight"],
      fontSize: 16,
      letterSpacing: 0.2,
    },
    infoBlock: {
      backgroundColor: C.card,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: C.border,
      marginTop: 8,
    },
    infoTitle: {
      color: C.foreground,
      fontSize: 16,
      fontWeight: "800" as TextStyle["fontWeight"],
    },
    infoSub: { marginTop: 6, color: C.mutedForeground, fontSize: 13 },
    hint: { color: C.mutedForeground, fontSize: 14 },
  });
