// app/.../ContestPaintingsScreen.tsx — FULL DROP‑IN FILE (VIP Gradient Card)
import { useGetPaintings } from "@/apis/painting";
import { useUserById } from "@/apis/user";
import SegmentedTabsScrollable, {
  TabItem,
  ColorSet as TabsColorSet,
} from "@/components/tabs/SegmentedTabsScrollable";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Painting } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

/* ============================ Utils ============================ */
function toAlpha(hex: string, a: number) {
  if (!hex) return `rgba(0,0,0,${a})`;
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* Nhấn mượt: scale khi press */
const PressableScale: React.FC<
  React.PropsWithChildren<{
    onPress?: () => void;
    style?: any;
    disabled?: boolean;
  }>
> = ({ children, onPress, style, disabled }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      friction: 6,
      tension: 170,
    }).start();
  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => !disabled && animate(0.97)}
      onPressOut={() => animate(1)}
      onPress={onPress}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

/* ===== Accent → Gradient helper ===== */
function gradientFromAccent(hex?: string): [string, string] {
  const fallbacks: [string, string] = ["#7C3AED", "#06B6D4"]; // violet → cyan
  if (!hex) return fallbacks;
  try {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const lighten = (v: number, amt = 28) => Math.min(255, v + amt);
    const darken = (v: number, amt = 24) => Math.max(0, v - amt);
    const c1 = `rgb(${lighten(r)},${lighten(g)},${lighten(b)})`;
    const c2 = `rgb(${darken(r)},${darken(g)},${darken(b)})`;
    return [c1, c2];
  } catch {
    return fallbacks;
  }
}

/* ===== Monogram avatar (fallback) ===== */
function Monogram({
  name,
  size = 28,
  bg = "#111827",
  fg = "#fff",
}: {
  name?: string;
  size?: number;
  bg?: string;
  fg?: string;
}) {
  const initials =
    (name?.trim()?.match(/\b\w/g) || []).slice(0, 2).join("").toUpperCase() ||
    "A";
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: bg,
      }}
    >
      <Text
        style={{
          color: fg,
          fontWeight: "800",
          fontSize: Math.max(12, size * 0.45),
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

/* ===== Types ===== */
type Round = {
  key: string;
  label: string;
  accentColor?: string;
  start?: string; // ISO
  end?: string; // ISO
};

export default function ContestPaintingsScreen() {
  const { contestId, contestTitle, rounds } = useLocalSearchParams<{
    contestId: string;
    contestTitle: string;
    rounds?: string; // JSON optional
  }>();

  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const s = styles(Colors[scheme]);

  const defaultRounds: Round[] = [
    { key: "prelim", label: "Sơ loại", accentColor: "#7C3AED" },
    { key: "quarter", label: "Tứ kết", accentColor: "#0EA5E9" },
    { key: "semi", label: "Bán kết", accentColor: "#10B981" },
    { key: "final", label: "Chung kết", accentColor: "#EF4444" },
  ];

  const parsedRounds = useMemo<Round[]>(() => {
    if (!rounds) return defaultRounds;
    try {
      const arr = JSON.parse(rounds as string);
      if (Array.isArray(arr) && arr.every((x) => x?.key && x?.label))
        return arr as Round[];
      return defaultRounds;
    } catch {
      return defaultRounds;
    }
  }, [rounds]);

  /* Ưu tiên tab đầu tiên */
  const [activeRoundKey, setActiveRoundKey] = useState(
    parsedRounds[0]?.key ?? "prelim"
  );

  /* API */
  const {
    data: paintings,
    isLoading,
    error,
  } = useGetPaintings({
    contestId: String(contestId || ""),
  });

  /* Round resolver: ưu tiên từ BE; fallback theo submissionDate ∈ [start, end] */
  function resolveRoundKey(p: Painting): string | undefined {
    // @ts-ignore
    if ((p as any).roundKey) return (p as any).roundKey;
    // @ts-ignore
    if ((p as any).roundName) {
      const found = parsedRounds.find(
        (r) =>
          r.label.toLowerCase() === String((p as any).roundName).toLowerCase()
      );
      if (found) return found.key;
    }
    if (p.submissionDate) {
      const ts = new Date(p.submissionDate).getTime();
      for (const r of parsedRounds) {
        if (r.start && r.end) {
          const a = new Date(r.start).getTime();
          const b = new Date(r.end).getTime();
          if (!isNaN(a) && !isNaN(b) && ts >= a && ts <= b) return r.key;
        }
      }
    }
    return undefined;
  }

  const roundTabs: TabItem[] = useMemo(
    () =>
      parsedRounds.map((r) => ({
        key: r.key,
        label: r.label,
        accentColor: r.accentColor,
      })),
    [parsedRounds]
  );

  const filtered = useMemo(() => {
    if (!paintings) return [] as Painting[];
    return paintings.filter((p) => {
      const k = resolveRoundKey(p);
      if (k) return k === activeRoundKey;
      return activeRoundKey === parsedRounds[0]?.key; // không xác định → cho vào sơ loại
    });
  }, [paintings, activeRoundKey, parsedRounds]);

  const TabsColor: TabsColorSet = {
    primary: C.primary,
    card: C.card,
    muted: C.border,
    mutedForeground: C.mutedForeground,
  };

  /* =============== NAV-LOCK chống double push =============== */
  const navLockRef = useRef(false);
  const openWithLock = useCallback(
    (painting: Painting, artist?: string) => {
      if (navLockRef.current) return;
      navLockRef.current = true;
      router.push({
        pathname: "/painting-evaluation",
        params: {
          paintingId: painting.paintingId,
          contestTitle,
          paintingTitle: painting.title,
          artistName: artist || `Artist ${painting.competitorId}`,
          imageUrl: encodeURIComponent(painting.imageUrl),
        },
      });
      setTimeout(() => {
        navLockRef.current = false;
      }, 800);
    },
    [contestTitle]
  );

  /* ============================ VIP CARD ============================ */
  const PaintingItem = ({ painting }: { painting: Painting }) => {
    const { data: user } = useUserById(painting.competitorId);
    const rKey = resolveRoundKey(painting);
    const rMeta = parsedRounds.find((r) => r.key === rKey);
    const [g0, g1] = gradientFromAccent(rMeta?.accentColor);

    return (
      <LinearGradient
        colors={[g0, g1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.vipWrap}
      >
        <View style={s.vipBorder}>
          <BlurView
            intensity={28}
            tint={scheme === "dark" ? "dark" : "light"}
            style={s.vipCard}
          >
            {/* MEDIA */}
            <View style={s.vipMedia}>
              <Image
                source={{ uri: painting.imageUrl }}
                style={s.vipImage}
                placeholder={require("@/assets/images/partial-react-logo.png")}
                contentFit="cover"
                transition={200}
              />
              <LinearGradient
                colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={s.vipShade}
              />

              {/* Top-left round chip */}
              <LinearGradient
                colors={[g0, g1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.roundBadge}
              >
                <Ionicons name="trophy-outline" size={12} color="#fff" />
                <Text style={s.roundBadgeText}>{rMeta?.label ?? "Tự do"}</Text>
              </LinearGradient>

              {/* Top-right date chip */}
              <View style={s.dateBadgeVip}>
                <Ionicons name="calendar-outline" size={12} color="#111827" />
                <Text style={s.dateBadgeVipText}>
                  {new Date(painting.submissionDate).toLocaleDateString()}
                </Text>
              </View>

              {/* Title on media */}
              <View style={s.titleOnMedia}>
                <Text numberOfLines={2} style={s.vipTitle}>
                  {painting.title}
                </Text>
              </View>
            </View>

            {/* META + CTA */}
            <View style={s.vipContent}>
              <View style={s.vipMetaRow}>
                <Monogram name={user?.fullName} size={28} bg={g1} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={s.vipArtistName}>
                    {user?.fullName || `Artist ${painting.competitorId}`}
                  </Text>
                  <Text numberOfLines={1} style={s.vipSubtle}>
                    #{painting.paintingId}
                  </Text>
                </View>
                <View style={s.microBadge}>
                  <Ionicons
                    name="color-palette-outline"
                    size={12}
                    color="#fff"
                  />
                  <Text style={s.microBadgeText}>Art</Text>
                </View>
              </View>

              <View style={s.vipDivider} />

              <PressableScale
                onPress={() => openWithLock(painting, user?.fullName)}
                style={s.vipCTA}
              >
                <LinearGradient
                  colors={[g0, g1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.vipCTAInner}
                >
                  <Ionicons name="create-outline" size={16} color="#ffffff" />
                  <Text style={s.vipCTAText}>Chấm bài</Text>
                  <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                </LinearGradient>
              </PressableScale>
            </View>
          </BlurView>
        </View>
      </LinearGradient>
    );
  };

  /* ============================ Render ============================ */
  if (isLoading) {
    return (
      <ImageBackground
        source={require("@/assets/images/bg/nencontestexaminer.jpg")}
        resizeMode="cover"
        style={s.bg}
        imageStyle={s.bgImage}
      >
        <View style={s.bgOverlay} />
        <View style={s.containerTransparent}>
          <View style={s.header}>
            <Pressable onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="arrow-back" size={22} color={C.foreground} />
            </Pressable>
            <Text style={s.headerTitle}>Tranh</Text>
          </View>
          <View style={s.loading}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={s.loadingText}>Đang tải tranh...</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground
        source={require("@/assets/images/bg/nencontestexaminer.jpg")}
        resizeMode="cover"
        style={s.bg}
        imageStyle={s.bgImage}
      >
        <View style={s.bgOverlay} />
        <View style={s.containerTransparent}>
          <View style={s.header}>
            <Pressable onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="arrow-back" size={22} color={C.foreground} />
            </Pressable>
            <Text style={s.headerTitle}>Tranh</Text>
          </View>
          <View style={s.center}>
            <Ionicons
              name="alert-circle-outline"
              size={64}
              color={C.mutedForeground}
            />
            <Text style={s.errorText}>Không thể tải tranh</Text>
            <Pressable style={s.retry} onPress={() => {}}>
              <Text style={s.retryText}>Thử lại</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/bg/nencontestexaminer.jpg")}
      resizeMode="cover"
      style={s.bg}
      imageStyle={s.bgImage}
    >
      <View style={s.bgOverlay} />

      <View style={s.containerTransparent}>
        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color={C.foreground} />
          </Pressable>
          <Text style={s.headerTitle} numberOfLines={1}>
            {contestTitle ? `${contestTitle} — Tranh` : "Tranh cuộc thi"}
          </Text>
        </View>

        {/* Tabs */}
        <SegmentedTabsScrollable
          tabs={roundTabs}
          activeKey={activeRoundKey}
          onChange={setActiveRoundKey}
          C={TabsColor}
          height={30}
          gap={10}
          underlineHeight={3}
          softBg
          autoScrollToActive
          scrollPaddingHorizontal={5}
        />

        {/* List */}
        {filtered && filtered.length > 0 ? (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.paintingId}
            renderItem={({ item }) => <PaintingItem painting={item} />}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={s.center}>
            <Ionicons
              name="images-outline"
              size={64}
              color={C.mutedForeground}
            />
            <Text style={s.emptyText}>Chưa có bài dự thi</Text>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

/* ============================ Styles ============================ */
const styles = (C: typeof Colors.light) =>
  StyleSheet.create({
    /* Background */
    bg: { flex: 1 },
    bgImage: { opacity: 0.9 },
    bgOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: toAlpha(C.background, 0.35),
    },

    /* Container in front of bg */
    containerTransparent: {
      flex: 1,
      backgroundColor: "transparent",
    },

    /* Header */
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 14,
      backgroundColor: toAlpha("#ffffff", 0.78),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: toAlpha(C.border, 0.7),
    },
    backBtn: { padding: 6, marginRight: 8, borderRadius: 10 },
    headerTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: C.foreground,
      flex: 1,
    },

    /* Loading / Error */
    loading: { flex: 1, alignItems: "center", justifyContent: "center" },
    loadingText: { marginTop: 12, fontSize: 15, color: C.mutedForeground },

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 28,
    },
    errorText: {
      fontSize: 15,
      color: C.mutedForeground,
      marginTop: 12,
      marginBottom: 18,
      textAlign: "center",
    },
    retry: {
      backgroundColor: C.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
    },
    retryText: { color: C.primaryForeground, fontWeight: "800" },

    /* List padding */
    list: { padding: 16 },

    /* ========== VIP Gradient Card styles ========== */
    vipWrap: {
      borderRadius: 22,
      padding: 2,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOpacity: 0.16,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 5,
    },
    vipBorder: {
      borderRadius: 20,
      overflow: "hidden",
      backgroundColor: toAlpha(C.card, 0.6),
    },
    vipCard: {
      overflow: "hidden",
      borderRadius: 20,
    },
    vipMedia: {
      position: "relative",
      width: "100%",
      aspectRatio: 4 / 3,
      backgroundColor: C.muted,
    },
    vipImage: { width: "100%", height: "100%" },
    vipShade: { ...StyleSheet.absoluteFillObject },

    roundBadge: {
      position: "absolute",
      top: 10,
      left: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    roundBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },

    dateBadgeVip: {
      position: "absolute",
      top: 10,
      right: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "#fff",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: toAlpha(C.border, 0.6),
    },
    dateBadgeVipText: { fontSize: 12, fontWeight: "800", color: "#111827" },

    titleOnMedia: {
      position: "absolute",
      left: 12,
      right: 12,
      bottom: 10,
    },
    vipTitle: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "900",
      letterSpacing: 0.2,
      textShadowColor: "rgba(0,0,0,0.35)",
      textShadowRadius: 6,
      textShadowOffset: { width: 0, height: 2 },
    },

    vipContent: {
      backgroundColor: toAlpha("#ffffff", 0.82),
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 14,
    },
    vipMetaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    vipArtistName: { fontSize: 14, fontWeight: "800", color: C.foreground },
    vipSubtle: { fontSize: 12, color: C.mutedForeground },

    microBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: toAlpha(C.foreground, 0.18),
    },
    microBadgeText: { fontSize: 12, fontWeight: "800", color: "#fff" },

    vipDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: toAlpha(C.border, 0.9),
      marginTop: 10,
      marginBottom: 12,
    },

    vipCTA: { borderRadius: 12, overflow: "hidden" },
    vipCTAInner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
    },
    vipCTAText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "900",
      letterSpacing: 0.3,
    },

    emptyText: {
      fontSize: 15,
      color: C.mutedForeground,
      marginTop: 12,
      textAlign: "center",
    },
  });
