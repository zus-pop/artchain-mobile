// app/painting-review-round1.tsx
import { useGetPaintings, useReviewEvaluationRound1 } from "@/apis/painting";
import { useUserById } from "@/apis/user";
import BrushButton from "@/components/buttons/BrushButton";
import EvaluationSubmitModal from "@/components/modals/EvaluationSubmitModal";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Painting } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Zoomable } from "@likashefqet/react-native-image-zoom";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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

/* ---------- Zoom modal (FULL) ---------- */
function ZoomModal({
  visible,
  uri,
  onClose,
  minScale = 1,
  maxScale = 6,
  doubleTapScale = 2.5,
}: {
  visible: boolean;
  uri: string;
  onClose: () => void;
  minScale?: number;
  maxScale?: number;
  doubleTapScale?: number;
}) {
  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      hardwareAccelerated
      transparent={false}
      supportedOrientations={[
        "portrait",
        "landscape",
        "landscape-left",
        "landscape-right",
      ]}
    >
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
        <Zoomable
          minScale={minScale}
          maxScale={maxScale}
          doubleTapScale={doubleTapScale}
          isDoubleTapEnabled
          style={{ flex: 1 }}
        >
          <Image
            source={{ uri }}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
          />
        </Zoomable>
        <Pressable
          onPress={onClose}
          style={{
            position: "absolute",
            top: 40,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.55)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.25)",
          }}
        >
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  );
}

export default function PaintingReviewRound1Screen() {
  const { contestId, contestTitle } = useLocalSearchParams<{
    contestId: string;
    contestTitle: string;
  }>();

  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const s = styles(Colors[scheme]);

  // Required number of paintings that must pass to next round
  const REQUIRED_PASSING_PAINTINGS = 20;

  /* API - Get paintings that passed round 1 */
  const {
    data: paintings,
    isLoading,
    error,
  } = useGetPaintings({
    contestId: contestId,
    roundName: "ROUND_1",
    is_passed: true,
  });

  const { mutate: reviewMutate, isPending: isReviewPending } =
    useReviewEvaluationRound1();

  // State to track which paintings are selected (temporarily changed isPassed status)
  const [selectedPaintings, setSelectedPaintings] = useState<Set<string>>(
    new Set()
  );

  // State for modals
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  // State for image viewer modal
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(
    null
  );

  /* Initialize selected paintings - all start as passed (true) */
  React.useEffect(() => {
    if (paintings) {
      const initialSelected = new Set(paintings.map((p) => p.paintingId));
      setSelectedPaintings(initialSelected);
    }
  }, [paintings]);

  /* Toggle painting selection */
  const togglePainting = useCallback((paintingId: string) => {
    setSelectedPaintings((prev) => {
      const newSet = new Set(prev);
      const isCurrentlySelected = newSet.has(paintingId);

      if (isCurrentlySelected) {
        newSet.delete(paintingId);
      } else {
        newSet.add(paintingId);
      }
      return newSet;
    });
  }, []);

  /* Open image viewer */
  const openImageViewer = useCallback((painting: Painting) => {
    setSelectedPainting(painting);
    setImageViewerOpen(true);
  }, []);

  /* Submit review */
  const handleSubmitReview = () => {
    if (!paintings) return;

    const reviewData = {
      paintings: paintings.map((painting) => ({
        paintingId: painting.paintingId,
        isPassed: selectedPaintings.has(painting.paintingId),
      })),
    };

    reviewMutate(reviewData, {
      onSuccess: () => {
        setConfirmOpen(false);
        setSuccessOpen(true);
      },
    });
  };

  /* ============================ VIP CARD ============================ */
  const PaintingItem = ({ painting }: { painting: Painting }) => {
    const { data: user } = useUserById(painting.competitorId);
    const [g0, g1] = gradientFromAccent("#7C3AED"); // Default gradient
    const isSelected = selectedPaintings.has(painting.paintingId);

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
            <Pressable
              onPress={() => openImageViewer(painting)}
              style={s.vipMedia}
            >
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

              {/* Selection indicator */}
              <View style={s.selectionIndicator}>
                <PressableScale
                  onPress={() => togglePainting(painting.paintingId)}
                  style={[s.checkbox, isSelected && s.checkboxSelected]}
                >
                  {isSelected ? (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  ) : (
                    <View style={s.checkboxEmpty} />
                  )}
                </PressableScale>
                <Text
                  style={[
                    s.selectionText,
                    isSelected && s.selectionTextSelected,
                  ]}
                >
                  {isSelected ? "ĐẠT" : "KHÔNG ĐẠT"}
                </Text>
              </View>

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
            </Pressable>

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

              <View style={s.passFailContainer}>
                <PressableScale
                  onPress={() => togglePainting(painting.paintingId)}
                  style={[
                    s.passFailButton,
                    !isSelected && s.passFailButtonActive,
                  ]}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={!isSelected ? "#fff" : "#ef4444"}
                  />
                  <Text
                    style={[
                      s.passFailText,
                      !isSelected && s.passFailTextActive,
                    ]}
                  >
                    KHÔNG ĐẠT
                  </Text>
                </PressableScale>

                <PressableScale
                  onPress={() => togglePainting(painting.paintingId)}
                  style={[
                    s.passFailButton,
                    isSelected && s.passFailButtonActive,
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={isSelected ? "#fff" : "#10b981"}
                  />
                  <Text
                    style={[s.passFailText, isSelected && s.passFailTextActive]}
                  >
                    ĐẠT
                  </Text>
                </PressableScale>
              </View>
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
            <Text style={s.headerTitle}>Xem lại Vòng 1</Text>
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
            <Text style={s.headerTitle}>Xem lại Vòng 1</Text>
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
    <View style={{ flex: 1 }}>
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
              {contestTitle ? `Xem lại — ${contestTitle}` : "Xem lại Vòng 1"}
            </Text>
          </View>

          {/* Summary */}
          <View style={s.summaryContainer}>
            <Text style={s.summaryText}>
              {selectedPaintings.size} / {REQUIRED_PASSING_PAINTINGS} tranh đạt
            </Text>
            {selectedPaintings.size !== REQUIRED_PASSING_PAINTINGS && (
              <Text style={s.requirementWarning}>
                ⚠️ Cần chọn đúng {REQUIRED_PASSING_PAINTINGS} tranh để nộp kết
                quả
              </Text>
            )}
          </View>

          {/* List */}
          {paintings && paintings.length > 0 ? (
            <FlatList
              data={paintings}
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

          {/* Submit Button */}
          {paintings && paintings.length > 0 && (
            <View style={s.submitContainer}>
              <View style={s.submitButtonWrapper}>
                <BrushButton
                  title={
                    isReviewPending ? "Đang gửi..." : "Nộp kết quả xem lại"
                  }
                  onPress={() => setConfirmOpen(true)}
                  disabled={
                    isReviewPending ||
                    selectedPaintings.size !== REQUIRED_PASSING_PAINTINGS
                  }
                  palette="pastel"
                  size="md"
                />
              </View>
            </View>
          )}
        </View>

        {/* Confirmation Modal */}
        <EvaluationSubmitModal
          visible={confirmOpen}
          variant="confirm"
          title="Nộp kết quả xem lại?"
          subtitle={`Xác nhận nộp kết quả cho ${selectedPaintings.size}/${REQUIRED_PASSING_PAINTINGS} tranh đã chọn.`}
          primaryText={isReviewPending ? "Đang gửi..." : "Nộp"}
          secondaryText="Huỷ"
          loading={isReviewPending}
          onSecondary={() => setConfirmOpen(false)}
          onPrimary={handleSubmitReview}
          onDismiss={() => setConfirmOpen(false)}
        />

        {/* Success Modal */}
        <EvaluationSubmitModal
          visible={successOpen}
          variant="success"
          title="Đã nộp kết quả"
          subtitle="Cảm ơn bạn! Kết quả xem lại đã được ghi nhận."
          primaryText="Hoàn thành"
          onPrimary={() => {
            setSuccessOpen(false);
            router.back();
          }}
          onDismiss={() => {
            setSuccessOpen(false);
            router.back();
          }}
        />
      </ImageBackground>

      {/* Image Viewer Modal - Using ZoomModal for zoom functionality */}
      <ZoomModal
        visible={imageViewerOpen}
        uri={selectedPainting?.imageUrl || ""}
        onClose={() => setImageViewerOpen(false)}
        minScale={1}
        maxScale={6}
        doubleTapScale={2.5}
      />
    </View>
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

    /* Summary */
    summaryContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: toAlpha(C.card, 0.8),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: toAlpha(C.border, 0.5),
    },
    summaryText: {
      fontSize: 14,
      fontWeight: "700",
      color: C.foreground,
      textAlign: "center",
    },
    requirementWarning: {
      fontSize: 12,
      fontWeight: "600",
      color: "#ef4444",
      textAlign: "center",
      marginTop: 4,
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

    /* Submit container */
    submitContainer: {
      padding: 16,
      backgroundColor: toAlpha(C.background, 0.9),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: toAlpha(C.border, 0.5),
    },
    submitButtonWrapper: {
      width: "100%",
      alignItems: "center",
    },

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

    /* Selection indicator */
    selectionIndicator: {
      position: "absolute",
      top: 10,
      left: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: C.border,
      backgroundColor: C.card,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxSelected: {
      backgroundColor: C.primary,
      borderColor: C.primary,
    },
    checkboxDisabled: {
      backgroundColor: C.muted,
      borderColor: C.muted,
      opacity: 0.6,
    },
    checkboxEmpty: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "transparent",
    },
    selectionText: {
      fontSize: 12,
      fontWeight: "900",
      color: C.mutedForeground,
      backgroundColor: toAlpha(C.card, 0.9),
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
    },
    selectionTextSelected: {
      color: "#fff",
      backgroundColor: C.primary,
      borderColor: C.primary,
    },
    selectionTextDisabled: {
      color: C.mutedForeground,
      backgroundColor: toAlpha(C.muted, 0.8),
      borderColor: C.muted,
      opacity: 0.6,
    },

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

    passFailContainer: {
      flexDirection: "row",
      gap: 12,
      paddingVertical: 8,
    },
    passFailButton: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: C.border,
      backgroundColor: C.card,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    passFailButtonActive: {
      backgroundColor: C.primary,
      borderColor: C.primary,
    },
    passFailButtonDisabled: {
      backgroundColor: C.muted,
      borderColor: C.muted,
      opacity: 0.6,
    },
    passFailText: {
      fontSize: 12,
      fontWeight: "800",
      color: C.mutedForeground,
    },
    passFailTextActive: {
      color: "#fff",
    },
    passFailTextDisabled: {
      color: C.mutedForeground,
    },

    emptyText: {
      fontSize: 15,
      color: C.mutedForeground,
      marginTop: 12,
      textAlign: "center",
    },
  });
