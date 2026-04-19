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
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useWhoAmI } from "../apis/auth";

function toAlpha(hex: string, a: number) {
  // Nếu không phải dạng #RRGGBB thì fallback luôn cho chắc
  if (!hex || !hex.startsWith("#") || (hex.length !== 7 && hex.length !== 4)) {
    return `rgba(0,0,0,${a})`;
  }

  let h = hex.replace("#", "");
  // Hỗ trợ #RGB
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(0,0,0,${a})`;
  }

  return `rgba(${r},${g},${b},${a})`;
}

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
        backgroundColor: " hsl(15 85% 55%)",
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
  const insets = useSafeAreaInsets();
  const s = styles(C);
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

  const navLockRef = useRef(false);
  const openWithLock = useCallback(
    (painting: Painting, artist?: string) => {
      if (navLockRef.current) return;
      navLockRef.current = true;

      let pathname: any = "/painting-evaluation-round2";

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
    [contestTitle, examinerRole],
  );

  /* ============================ MINIMALIST PAINTING CARD ============================ */
  const PaintingItem = ({ painting }: { painting: Painting }) => {
    const { data: user } = useUserById(painting.competitorId);

    const roundLabel =
      examinerRole === "ROUND_1"
        ? "Vòng Sơ Khảo"
        : examinerRole === "ROUND_2"
          ? "Vòng Chung Khảo"
          : "Tranh dự thi";

    return (
      <PressableScale
        onPress={() => openWithLock(painting, user?.fullName)}
        style={s.paintingCard}
      >
        <View style={s.cardGradientWrapper}>
          <LinearGradient
            colors={[
              toAlpha(C.primary, 0.7),
              toAlpha(C.primary, 0.1),
              toAlpha(C.card, 0.95),
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.cardInner}
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
              <View style={s.overlayGradient}>
                <View style={s.overlayText}>
                  <View style={s.chipRow}>
                    <View style={s.chip}>
                      <Ionicons
                        name="color-palette-outline"
                        size={14}
                        color="#fff"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={s.chipText}>{roundLabel}</Text>
                    </View>
                  </View>

                  <View style={s.overlayBottom}>
                    <Text numberOfLines={2} style={s.paintingTitle}>
                      {painting.title}
                    </Text>
                    <View style={s.artistRow}>
                      <Monogram name={user?.fullName} size={22} />
                      <Text numberOfLines={1} style={s.artistName}>
                        {user?.fullName || `Artist ${painting.competitorId}`}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </PressableScale>
    );
  };

  /* ============================ Render ============================ */
  if (isLoading) {
    return (
      <View style={[s.container, { backgroundColor: C.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={C.primary} />
        <View style={[s.header, { paddingTop: insets.top }]}>
          <Pressable
            onPress={() => router.back()}
            style={s.backBtn}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={C.primaryForeground}
            />
          </Pressable>
          <Text style={s.headerTitle}>Tranh</Text>
        </View>
        <View style={s.loading}>
          <ActivityIndicator size="large" color={C.primaryForeground} />
          <Text style={s.loadingText}>Đang tải tranh...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[s.container, { backgroundColor: C.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={C.primary} />
        <View style={[s.header, { paddingTop: insets.top }]}>
          <Pressable
            onPress={() => router.back()}
            style={s.backBtn}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={C.primaryForeground}
            />
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
    <View style={[s.container, { backgroundColor: C.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top }]}>
        <Pressable
          onPress={() => router.back()}
          style={s.backBtn}
          android_ripple={{ color: "rgba(255,255,255,0.2)" }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color={C.primaryForeground} />
        </Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>
          {contestTitle ? `${contestTitle}` : "Tranh cuộc thi"}
        </Text>
      </View>

      {paintings && paintings.paintings.length > 0 ? (
        <SafeAreaView edges={["left", "right", "bottom"]} style={{ flex: 1 }}>
          <FlatList
            data={paintings.paintings}
            keyExtractor={(item) => item.paintingId}
            renderItem={({ item }) => <PaintingItem painting={item} />}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      ) : (
        <SafeAreaView
          edges={["left", "right", "bottom"]}
          style={{ flex: 1, justifyContent: "center" }}
        >
          <View style={s.center}>
            <Ionicons
              name="images-outline"
              size={64}
              color={C.mutedForeground}
            />
            <Text style={s.emptyText}>Chưa có bài dự thi hoặc đã chấm hết</Text>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

/* ============================ Styles ============================ */
const styles = (C: any) =>
  StyleSheet.create({
    /* Container */
    container: {
      flex: 1,
      backgroundColor: C.newbackground,
    },

    /* Header */
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingHorizontal: 12,
      paddingBottom: 10,
      backgroundColor: C.primary,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: toAlpha("#000000", 0.15),
      shadowColor: "#000",
      shadowOpacity: Platform.OS === "ios" ? 0.12 : 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    backBtn: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 8,
      backgroundColor: toAlpha("#ffffff", 0.15),
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: C.primaryForeground,
      flex: 1,
      marginLeft: 10,
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
      borderRadius: 999,
    },
    retryText: { color: C.primaryForeground, fontWeight: "800" },

    list: {
      padding: 16,
      paddingBottom: 32,
    },

    paintingCard: {
      borderRadius: 22,
      marginBottom: 18,
      shadowColor: "#000",
      shadowOpacity: 0.16,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
      overflow: "visible",
    },
    cardGradientWrapper: {
      borderRadius: 22,
      overflow: "hidden",
    },
    cardInner: {
      borderRadius: 22,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: toAlpha(C.border, 0.5),
    },
    imageContainer: {
      position: "relative",
      width: "100%",
      aspectRatio: 4 / 3,
      overflow: "hidden",
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
      justifyContent: "flex-start",
    },
    overlayText: {
      flex: 1,
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 12,
      justifyContent: "space-between",
    },
    chipRow: {
      flexDirection: "row",
      justifyContent: "flex-start",
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: C.primary,
    },
    chipText: {
      fontSize: 11,
      fontWeight: "600",
      color: "#ffffff",
      letterSpacing: 0.3,
    },
    overlayBottom: {
      marginTop: 18,
    },
    paintingTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: "#ffffff",
      marginBottom: 6,
      textShadowColor: "rgba(0,0,0,0.6)",
      textShadowRadius: 6,
      textShadowOffset: { width: 0, height: 3 },
    },
    artistRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    artistName: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: "rgba(255, 255, 255, 0.92)",
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
