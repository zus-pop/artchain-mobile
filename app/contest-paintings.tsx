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
import { Image } from "expo-image";
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

  const [activeRoundKey, setActiveRoundKey] = useState(
    parsedRounds[0]?.key ?? "prelim"
  );

  const {
    data: paintings,
    isLoading,
    error,
  } = useGetPaintings({
    contestId: String(contestId || ""),
  });

  // Ưu tiên thuộc tính từ BE; fallback theo submissionDate ∈ [start, end]
  function resolveRoundKey(p: Painting): string | undefined {
    // @ts-ignore
    if (p.roundKey) return p.roundKey;
    // @ts-ignore
    if (p.roundName) {
      const found = parsedRounds.find(
        (r) => r.label.toLowerCase() === String(p.roundName).toLowerCase()
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
    if (!paintings) return [];
    return paintings.filter((p) => {
      const k = resolveRoundKey(p);
      if (k) return k === activeRoundKey;
      return activeRoundKey === parsedRounds[0]?.key; // nếu không xác định được round -> cho vào sơ loại
    });
  }, [paintings, activeRoundKey, parsedRounds]);

  const TabsColor: TabsColorSet = {
    primary: C.primary,
    card: C.card,
    muted: C.border, // base alpha cho nền tabs
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

  /* ============================ Item Card ============================ */
  const PaintingItem = ({ painting }: { painting: Painting }) => {
    const { data: user } = useUserById(painting.competitorId);

    return (
      // Card KHÔNG điều hướng — chỉ CTA bên dưới mới điều hướng
      <View style={s.card}>
        {/* Ảnh 4:3 – viền bo, bóng nhẹ */}
        <View style={s.imageWrap}>
          <Image
            source={{ uri: painting.imageUrl }}
            style={s.image}
            placeholder={require("@/assets/images/partial-react-logo.png")}
            contentFit="cover"
            transition={200}
          />
          {/* Badge ngày góc phải */}
          <View style={s.dateBadge}>
            <Ionicons name="calendar-outline" size={12} color={C.primary} />
            <Text style={s.dateBadgeText}>
              {new Date(painting.submissionDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Nội dung trắng rõ chữ */}
        <View style={s.content}>
          {/* Tiêu đề */
          /* đậm, chữ gọn, không quá 2 dòng */}
          <Text style={s.title} numberOfLines={2}>
            {painting.title}
          </Text>

          {/* Hàng meta: Nghệ sĩ + Vòng */}
          <View style={s.metaRow}>
            <Text style={s.artistText} numberOfLines={1}>
              <Text style={s.metaLabel}>Nghệ sĩ: </Text>
              {user?.fullName || `Artist ${painting.competitorId}`}
            </Text>

            <View style={s.roundChip}>
              <Ionicons name="trophy-outline" size={12} color={C.primary} />
              <Text style={s.roundChipText}>
                {parsedRounds.find((r) => r.key === resolveRoundKey(painting))
                  ?.label ?? "Tự do"}
              </Text>
            </View>
          </View>

          <View style={s.divider} />

          {/* CTA: chỉ nút này mới điều hướng */}
          <PressableScale
            onPress={() => openWithLock(painting, user?.fullName)}
            style={s.cta}
          >
            <View style={{display: "flex", flexDirection: "row", alignItems: "center", gap: 8}}>
              <Ionicons
                name="create-outline"
                size={16}
                color={C.primaryForeground}
              />
              <Text style={s.ctaText}>Chấm bài</Text>
            </View>
          </PressableScale>
        </View>
      </View>
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
      {/* Lớp overlay làm dịu nền để nội dung nổi bật */}
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

        {/* Tabs rời, scroll ngang */}
        <SegmentedTabsScrollable
          tabs={roundTabs}
          activeKey={activeRoundKey}
          onChange={setActiveRoundKey}
          C={{
            primary: C.primary,
            card: C.card,
            muted: C.border,
            mutedForeground: C.mutedForeground,
          }}
          height={46}
          gap={14}
          underlineHeight={3}
          softBg
          autoScrollToActive
          scrollPaddingHorizontal={16}
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

    /* Container trong suốt để lộ nền */
    containerTransparent: {
      flex: 1,
      backgroundColor: "transparent",
    },

    /* Header & trạng thái */
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

    /* List padding để card tách nền đẹp */
    list: { padding: 16 },

    /* Card promax */
    card: {
      borderRadius: 18,
      backgroundColor: "#fff",
      marginBottom: 16,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: toAlpha(C.border, 0.5),
    },

    imageWrap: {
      position: "relative",
      width: "100%",
      aspectRatio: 4 / 3,
      backgroundColor: C.muted,
    },
    image: { width: "100%", height: "100%" },

    dateBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: toAlpha("#ffffff", 0.94),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: toAlpha(C.border, 0.6),
    },
    dateBadgeText: { fontSize: 12, fontWeight: "700", color: C.foreground },

    content: {
      backgroundColor: "#ffffff",
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 14,
    },
    title: {
      fontSize: 16,
      fontWeight: "900",
      color: C.foreground,
      marginBottom: 8,
      letterSpacing: 0.2,
    },

    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    metaLabel: { fontWeight: "800", color: C.foreground },
    artistText: { flex: 1, fontSize: 14, color: C.mutedForeground },

    roundChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: toAlpha(C.primary, 0.08),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: toAlpha(C.primary, 0.3),
    },
    roundChipText: { fontSize: 12, fontWeight: "800", color: C.primary },

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: toAlpha(C.border, 0.9),
      marginBottom: 12,
    },

    cta: {
      backgroundColor: C.primary,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    ctaText: {
      color: C.primaryForeground,
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
