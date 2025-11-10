// components/modals/AchievementModal.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { AchievementItem } from "@/types/achievements";
import { Ionicons } from "@expo/vector-icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ArtworkPlaceholder from "../ArtworkPlaceholder";

/* ================= Helpers ================= */
const ACCENT = "hsl(15 85% 55%)";

/** Chỉ lấy ngày từ chuỗi ISO → "DD/MM/YYYY", không tạo new Date để tránh lệch TZ */
const fmtDateOnlyISO = (v?: string | null) => {
  if (!v) return "—";
  // Kỳ vọng dạng 2025-11-04T17:12:20.737Z
  const iso = String(v);
  const ymd = iso.split("T")[0]; // "YYYY-MM-DD"
  const [y, m, d] = ymd.split("-");
  if (!y || !m || !d) return "—";
  return `${d}/${m}/${y}`;
};

const fmtPrize = (p: number | string) => {
  const n = typeof p === "string" ? parseFloat(p) : p;
  return Number.isFinite(n) ? n.toLocaleString("vi-VN") + "₫" : String(p);
};

type Props = {
  visible: boolean;
  onClose: () => void;
  item?: AchievementItem | null;
  maxHeightPct?: number;
  disableBackdropClose?: boolean;
  showClose?: boolean;
};

export default function AchievementModal({
  visible,
  onClose,
  item,
  maxHeightPct = 0.92,
  disableBackdropClose,
  showClose = true,
}: Props) {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];

  const screenH = useMemo(() => Dimensions.get("window").height, []);
  const [mounted, setMounted] = useState<boolean>(visible);

  // animated values
  const backdrop = useRef(new Animated.Value(0)).current; // 0..1
  const sheetY = useRef(new Animated.Value(screenH)).current; // start off-screen
  const dragY = useRef(new Animated.Value(0)).current; // live drag
  const translateY = Animated.add(sheetY, dragY);

  // scroll vs drag
  const scrollYRef = useRef(0);
  const isDraggingRef = useRef(false);

  // thresholds
  const DISMISS_TRANSLATE = 120;
  const DISMISS_VY = 0.9;

  useEffect(() => {
    if (visible) {
      if (!mounted) setMounted(true);
      sheetY.setValue(screenH);
      dragY.setValue(0);
      backdrop.setValue(0);
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sheetY, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(sheetY, {
          toValue: screenH,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Android back
  useEffect(() => {
    if (!mounted) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      closeNow();
      return true;
    });
    return () => sub.remove();
  }, [mounted]);

  const closeNow = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(sheetY, {
        toValue: screenH,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMounted(false);
      onClose?.();
    });
  }, [backdrop, sheetY, screenH, onClose]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, g) => {
        if (g.dy > 6 && Math.abs(g.dx) < 16 && scrollYRef.current <= 0)
          return true;
        return false;
      },
      onMoveShouldSetPanResponder: (_, g) =>
        g.dy > 6 && scrollYRef.current <= 0,
      onPanResponderGrant: () => {
        isDraggingRef.current = true;
      },
      onPanResponderMove: (_, g) => {
        const dy = Math.max(0, g.dy);
        dragY.setValue(dy);
        const ratio = Math.max(0, Math.min(1, 1 - dy / screenH));
        backdrop.setValue(ratio);
      },
      onPanResponderRelease: (_, g) => {
        isDraggingRef.current = false;
        const shouldDismiss = g.dy > DISMISS_TRANSLATE || g.vy > DISMISS_VY;
        if (shouldDismiss) closeNow();
        else {
          Animated.parallel([
            Animated.spring(dragY, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 0,
              speed: 18,
            }),
            Animated.timing(backdrop, {
              toValue: 1,
              duration: 140,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
      onPanResponderTerminate: () => {
        isDraggingRef.current = false;
        Animated.parallel([
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
            speed: 18,
          }),
          Animated.timing(backdrop, {
            toValue: 1,
            duration: 140,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;

  if (!mounted || !item) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={closeNow}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={!disableBackdropClose ? closeNow : undefined}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.5)", opacity: backdrop },
          ]}
        />
      </Pressable>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: C.card,
            borderColor: C.border,
            maxHeight: screenH * maxHeightPct,
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Header */}
        <View style={styles.topChrome}>
          <View
            style={styles.dragZone}
            {...panResponder.panHandlers}
            accessibilityRole="button"
            accessibilityLabel="Kéo xuống để đóng"
            hitSlop={{ top: 10, bottom: 10, left: 24, right: 24 }}
          >
            <View style={[styles.handle, { backgroundColor: C.border }]} />
          </View>

          <View style={[styles.header, { borderBottomColor: C.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIcon, { backgroundColor: ACCENT }]}>
                <Ionicons name="trophy" size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.title, { color: C.foreground }]}
                  numberOfLines={1}
                >
                  {item.award?.name ?? "Giải thưởng"}
                </Text>
                <Text
                  style={[styles.subtitle, { color: C.mutedForeground }]}
                  numberOfLines={1}
                >
                  {item.contest?.title ?? "—"}
                </Text>
              </View>
            </View>

            {showClose && (
              <TouchableOpacity
                onPress={closeNow}
                style={styles.iconBtn}
                hitSlop={10}
              >
                <Ionicons name="close" size={22} color={ACCENT} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isDraggingRef.current}
          onScroll={(e) => {
            scrollYRef.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          bounces
        >
          {/* Ảnh / Placeholder */}
          {item.paintingImage ? (
            <View style={[styles.imageWrap, { borderColor: C.border }]}>
              <Animated.Image
                source={{ uri: item.paintingImage }}
                style={styles.image}
                resizeMode="cover"
              />
              {!!item.award?.rank && (
                <View style={[styles.badge, { backgroundColor: ACCENT }]}>
                  <Ionicons name="ribbon" size={14} color="#fff" />
                  <Text style={styles.badgeTxt}>Top {item.award.rank}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.imageWrap, { borderColor: C.border }]}>
              <ArtworkPlaceholder
                solidBorder
                height={180}
                rounded={12}
                message="Tranh sẽ được chúng tôi cập nhật sớm nhất có thể"
                style={{ height: "100%", width: "100%" }}
              />
              {!!item.award?.rank && (
                <View style={[styles.badge, { backgroundColor: ACCENT }]}>
                  <Ionicons name="ribbon" size={14} color="#fff" />
                  <Text style={styles.badgeTxt}>Top {item.award.rank}</Text>
                </View>
              )}
            </View>
          )}

          {/* Thông tin chi tiết */}
          <View style={{ gap: 12 }}>
            {!!item.paintingTitle && (
              <>
                <Text
                  style={{
                    fontSize: 19,
                    color: C.foreground,
                    fontFamily: "Be Vietnam Pro",
                    fontWeight: "700",
                    textAlign: "center",
                  }}
                >
                  {item.paintingTitle}
                </Text>
                <View style={{ height: 1, backgroundColor: C.border }} />
              </>
            )}

            <Row
              C={C}
              icon="flag-outline"
              label="Cuộc thi"
              value={item.contest?.title || "—"}
              accent={ACCENT}
            />
            <Row
              C={C}
              icon="time-outline"
              label="Thời gian"
              value={
                item.contest?.startDate && item.contest?.endDate
                  ? `${fmtDateOnlyISO(
                      item.contest.startDate
                    )} → ${fmtDateOnlyISO(item.contest.endDate)}`
                  : "—"
              }
              accent={ACCENT}
            />
            <View style={{ height: 1, backgroundColor: C.border }} />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <Row
                C={C}
                icon="ribbon-outline"
                label="Xếp hạng"
                value={item.award?.rank ? `Hạng ${item.award.rank}` : "—"}
                accent={ACCENT}
              />
              <Row
                C={C}
                icon="cash-outline"
                label="Giải thưởng"
                value={
                  item.award?.prize != null
                    ? fmtPrize(item.award.prize as any)
                    : "—"
                }
                accent={ACCENT}
              />
            </View>

            {/* Ngày đạt */}
            <Row
              C={C}
              icon="calendar-outline"
              label="Ngày đạt"
              value={fmtDateOnlyISO(item.achievedDate)}
              accent={ACCENT}
            />

            {/* Mô tả giải */}
            {!!item.award?.description && (
              <Row
                C={C}
                icon="document-text-outline"
                label="Mô tả giải"
                value={item.award.description}
                multiline
                accent={ACCENT}
              />
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={closeNow}
              style={[styles.primaryBtn, { backgroundColor: ACCENT }]}
            >
              <Text style={styles.primaryBtnTxt}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

function Row({
  C,
  icon,
  label,
  value,
  multiline,
  accent,
}: {
  C: any;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  multiline?: boolean;
  accent: string;
}) {
  return (
    <View style={{ gap: 6, flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons
          name={icon}
          size={16}
          color={accent}
          style={{ marginRight: 6 }}
        />
        <Text
          style={{
            fontSize: 15,
            color: C.primary,
            fontFamily: "Be Vietnam Pro",
          }}
        >
          {label}
        </Text>
      </View>
      {!!value && (
        <Text
          style={{
            color: "gray",
            fontWeight: "600",
            lineHeight: 20,
            fontFamily: "Be Vietnam Pro",
          }}
          numberOfLines={multiline ? 0 : 3}
        >
          {value}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  topChrome: { paddingTop: 6 },
  dragZone: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 8,
  },
  handle: { width: 60, height: 6, borderRadius: 999, opacity: 0.9 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "800" },
  subtitle: { fontSize: 12 },
  iconBtn: { padding: 6, marginLeft: 4 },

  imageWrap: {
    height: 220,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
    borderWidth: StyleSheet.hairlineWidth,
  },
  image: { width: "100%", height: "100%" },
  badge: {
    position: "absolute",
    right: 10,
    bottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeTxt: { color: "#fff", fontWeight: "800", fontSize: 12 },

  footer: { flexDirection: "row", marginTop: 16, justifyContent: "center" },
  primaryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 4,
    width: "90%",
  },
  primaryBtnTxt: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
  },
});
