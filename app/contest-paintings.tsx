// app/.../ContestPaintingsScreen.tsx — FULL DROP‑IN FILE (VIP Gradient Card)
import { useGetPaintings } from "@/apis/painting";
import { useUserById } from "@/apis/user";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { ExaminerRole, Painting } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useWhoAmI } from "../apis/auth";

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

export default function ContestPaintingsScreen() {
  const { contestId, contestTitle, examinerRole } = useLocalSearchParams<{
    contestId: string;
    contestTitle: string;
    examinerRole: ExaminerRole;
  }>();

  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const s = styles(Colors[scheme]);
  const { data: user } = useWhoAmI();
  /* API */
  const {
    data: paintings,
    isLoading,
    error,
  } = useGetPaintings({
    contestId: contestId,
    roundName:
      examinerRole === "ROUND_1"
        ? "ROUND_1"
        : examinerRole === "ROUND_2"
        ? "ROUND_2"
        : undefined,
    status: examinerRole !== "ROUND_2" ? "ACCEPTED" : undefined,
    examinerId: user?.userId,
  });

  /* =============== NAV-LOCK chống double push =============== */
  const navLockRef = useRef(false);
  const openWithLock = useCallback(
    (painting: Painting, artist?: string) => {
      if (navLockRef.current) return;
      navLockRef.current = true;

      let pathname: any = "/painting-evaluation-round2"; // default

      switch (examinerRole) {
        case "ROUND_1":
          pathname = "/painting-evaluation-round1";
          break;
        case "ROUND_2":
          pathname = "/painting-evaluation-round2";
          break;
      }

      router.push({
        pathname,
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
    [contestTitle, examinerRole]
  );

  /* ============================ MINIMALIST PAINTING CARD ============================ */
  const PaintingItem = ({ painting }: { painting: Painting }) => {
    const { data: user } = useUserById(painting.competitorId);

    return (
      <PressableScale
        onPress={() => openWithLock(painting, user?.fullName)}
        style={s.paintingCard}
      >
        <View style={s.imageContainer}>
          <Image
            source={{ uri: painting.imageUrl }}
            style={s.paintingImage}
            placeholder={require("@/assets/images/partial-react-logo.png")}
            contentFit="cover"
            transition={200}
          />

          {/* Overlay text above image */}
          <LinearGradient
            colors={["rgba(0, 0, 0, 0.7)", "rgba(0, 0, 0, 0.3)", "transparent"]}
            locations={[0, 0.4, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={s.overlayGradient}
          >
            <View style={s.overlayText}>
              <Text numberOfLines={2} style={s.paintingTitle}>
                {painting.title}
              </Text>
              <Text style={s.artistName}>
                {user?.fullName || `Artist ${painting.competitorId}`}
              </Text>
            </View>
          </LinearGradient>
        </View>
      </PressableScale>
    );
  };

  /* ============================ Render ============================ */
  if (isLoading) {
    return (
      <View style={s.container}>
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
    );
  }

  if (error) {
    return (
      <View style={s.container}>
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
    );
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.foreground} />
        </Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>
          {contestTitle ? `${contestTitle} — Tranh` : "Tranh cuộc thi"}
        </Text>
      </View>

      {paintings && paintings.paintings.length > 0 ? (
        <FlatList
          data={paintings.paintings}
          keyExtractor={(item) => item.paintingId}
          renderItem={({ item }) => <PaintingItem painting={item} />}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={s.center}>
          <Ionicons name="images-outline" size={64} color={C.mutedForeground} />
          <Text style={s.emptyText}>Chưa có bài dự thi hoặc đã chấm hết</Text>
        </View>
      )}
    </View>
  );
}

/* ============================ Styles ============================ */
const styles = (C: typeof Colors.light) =>
  StyleSheet.create({
    /* Container */
    container: {
      flex: 1,
      backgroundColor: C.background,
    },

    /* Header */
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 14,
      backgroundColor: C.background,
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

    /* ========== MINIMALIST PAINTING CARD styles ========== */
    paintingCard: {
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 16,
      backgroundColor: C.card,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    imageContainer: {
      position: "relative",
      width: "100%",
      aspectRatio: 4 / 3,
    },
    paintingImage: {
      width: "100%",
      height: "100%",
    },
    overlayGradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    overlayText: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      padding: 16,
    },
    paintingTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: "#ffffff",
      marginBottom: 4,
      textShadowColor: "rgba(0,0,0,0.5)",
      textShadowRadius: 4,
      textShadowOffset: { width: 0, height: 2 },
    },
    artistName: {
      fontSize: 14,
      fontWeight: "600",
      color: "rgba(255, 255, 255, 0.9)",
    },

    emptyText: {
      fontSize: 15,
      color: C.mutedForeground,
      marginTop: 12,
      textAlign: "center",
    },

    reviewRound1Title: {
      fontSize: 20,
      fontWeight: "800",
      color: C.foreground,
      marginTop: 16,
      marginBottom: 8,
      textAlign: "center",
    },
    reviewRound1Text: {
      fontSize: 15,
      color: C.mutedForeground,
      textAlign: "center",
      lineHeight: 22,
      maxWidth: 280,
    },
  });
