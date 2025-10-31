import { usePaintingEvaluations } from "@/apis/painting";
import { Colors } from "@/constants/theme";
import { Painting } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type Scheme = "light" | "dark";

type Props = {
  visible: boolean;
  onClose: () => void;
  scheme: Scheme;
  submission: Painting;
};

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get("window");
const SHEET_MAX_H = SCREEN_H * 0.94;
const SNAP = { OPEN: 0, DISMISS: SCREEN_H };
const DRAG_CLOSE_THRESHOLD = 120;
const VELOCITY_CLOSE_THRESHOLD = 1.0;
const FOOTER_H = 70;
const HERO_H = Math.min(360, Math.max(260, SCREEN_H * 0.42));

const SubmissionDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  scheme,
  submission,
}) => {
  const { data: evaluations = [], isLoading } = usePaintingEvaluations(
    submission?.paintingId
  );

  const C = Colors[scheme];
  const isDark = scheme === "dark";

  // ---------- Animated states ----------
  const translateY = useRef(new Animated.Value(SNAP.DISMISS)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const dragOffset = useRef(0);
  const scrollYRef = useRef(0);

  // Parallax for hero image
  const scrollYAnim = useRef(new Animated.Value(0)).current;
  const heroScale = scrollYAnim.interpolate({
    inputRange: [-120, 0, 120],
    outputRange: [1.12, 1, 1],
    extrapolate: "clamp",
  });
  const heroTranslateY = scrollYAnim.interpolate({
    inputRange: [-120, 0, 120],
    outputRange: [-20, 0, 0],
    extrapolate: "clamp",
  });

  // ---------- Sheet open/close ----------
  const openSheet = useCallback(() => {
    translateY.setValue(SNAP.DISMISS);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: SNAP.OPEN,
        useNativeDriver: true,
        stiffness: 200,
        damping: 22,
        mass: 0.9,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dragOffset.current = SNAP.OPEN;
    });
  }, [translateY, backdropOpacity]);

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: SNAP.DISMISS,
        useNativeDriver: true,
        stiffness: 200,
        damping: 22,
        mass: 0.95,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dragOffset.current = SNAP.DISMISS;
      onClose?.();
    });
  }, [translateY, backdropOpacity, onClose]);

  const animateTo = useCallback(
    (to: number) => {
      if (to === SNAP.DISMISS) return closeSheet();
      Animated.spring(translateY, {
        toValue: to,
        useNativeDriver: true,
        stiffness: 200,
        damping: 22,
        mass: 0.9,
      }).start(() => (dragOffset.current = to));
    },
    [closeSheet, translateY]
  );

  useEffect(() => {
    if (visible) requestAnimationFrame(openSheet);
  }, [visible, openSheet]);

  // ---------- Gestures ----------
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => {
          const isVertical = Math.abs(g.dy) > Math.abs(g.dx);
          const pullingDown = g.dy > 6;
          const canGrab =
            scrollYRef.current <= 0 || dragOffset.current > SNAP.OPEN;
          return isVertical && pullingDown && canGrab;
        },
        onPanResponderGrant: () => translateY.stopAnimation(),
        onPanResponderMove: (_, g) => {
          const next = Math.max(SNAP.OPEN, dragOffset.current + g.dy);
          translateY.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          const endY = dragOffset.current + g.dy;
          const shouldClose =
            g.vy > VELOCITY_CLOSE_THRESHOLD || endY > DRAG_CLOSE_THRESHOLD;
          animateTo(shouldClose ? SNAP.DISMISS : SNAP.OPEN);
        },
      }),
    [animateTo, translateY]
  );

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = e.nativeEvent.contentOffset.y;
  };

  // ---------- Helpers: status mapping ----------
  const statusMap = useMemo(
    () => ({
      WINNER: { text: "Giải thưởng", bg: C.accent ?? "#22c55e", fg: "#fff" },
      APPROVED: { text: "Được duyệt", bg: C.primary ?? "#3b82f6", fg: "#fff" },
      ACCEPTED: {
        text: "Được chấp nhận",
        bg: C.chart2 ?? "#06b6d4",
        fg: "#fff",
      },
      REJECTED: {
        text: "Bị từ chối",
        bg: C.destructive ?? "#ef4444",
        fg: "#fff",
      },
      DENIED: { text: "Từ chối", bg: C.destructive ?? "#ef4444", fg: "#fff" },
      REVIEWING: {
        text: "Đang đánh giá",
        bg: C.chart3 ?? "#f59e0b",
        fg: "#111827",
      },
      PENDING: { text: "Đang xử lý", bg: C.chart3 ?? "#f59e0b", fg: "#111827" },
      SUBMITTED: { text: "Đã nộp", bg: C.muted ?? "#e5e7eb", fg: C.foreground },
      UNKNOWN: { text: "Không xác định", bg: C.muted, fg: C.mutedForeground },
    }),
    [C]
  );

  const statusKey =
    (submission?.status as keyof typeof statusMap) || ("UNKNOWN" as const);
  const STATUS = statusMap[statusKey] ?? statusMap.UNKNOWN;

  // ---------- Derived ----------
  const averageScore = useMemo(() => {
    if (!evaluations?.length) return 0;
    const total = evaluations.reduce((sum, e) => sum + (e.score ?? 0), 0);
    return Math.round((total / evaluations.length) * 10) / 10;
  }, [evaluations]);

  if (!visible || !submission) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      <View style={st.wrap}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={closeSheet}>
          <Animated.View
            style={[
              st.backdrop,
              {
                backgroundColor: isDark
                  ? "rgba(0,0,0,0.6)"
                  : "rgba(0,0,0,0.45)",
                opacity: backdropOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <Animated.View
          style={[
            st.sheet,
            {
              backgroundColor: C.card,
              borderColor: C.border,
              maxHeight: SHEET_MAX_H,
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Grabber + glass header floating over hero */}
          <View style={st.glassHeader}>
            <View
              style={[
                st.grabber,
                { backgroundColor: isDark ? "#4b5563" : "#cbd5e1" },
              ]}
            />
            <View style={st.headerRow}>
              <View style={st.headerLeft}>
                <Ionicons name="color-palette-outline" size={16} color="#fff" />
                <Text style={st.headerTitle} numberOfLines={1}>
                  Chi tiết bài dự thi
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeSheet}
                activeOpacity={0.85}
                style={st.iconBtn}
              >
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: FOOTER_H + 18 }}
            keyboardShouldPersistTaps="handled"
            bounces
            scrollEventThrottle={16}
            onScroll={(e) => {
              onScroll(e);
              scrollYAnim.setValue(e.nativeEvent.contentOffset.y);
            }}
          >
            {/* HERO image with parallax & overlay */}
            <View style={st.heroWrap}>
              <Animated.Image
                source={{ uri: submission.imageUrl }}
                resizeMode="cover"
                style={[
                  st.heroImg,
                  {
                    transform: [
                      { translateY: heroTranslateY },
                      { scale: heroScale },
                    ],
                  },
                ]}
              />
              <LinearGradient
                colors={[
                  "rgba(0,0,0,0.0)",
                  "rgba(0,0,0,0.0)",
                  isDark ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.35)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              {/* Hero bottom info */}
              <View style={st.heroInfo}>
                <Text style={st.heroTitle} numberOfLines={2}>
                  {submission.title}
                </Text>
                <View style={st.chipsRow}>
                  <View
                    style={[
                      st.chip,
                      {
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.12)"
                          : "rgba(255,255,255,0.2)",
                      },
                    ]}
                  >
                    <Ionicons name="trophy-outline" size={12} color="#fff" />
                    <Text style={st.chipTxt} numberOfLines={1}>
                      {submission.contest?.title}
                    </Text>
                  </View>
                  <View
                    style={[
                      st.chip,
                      {
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.12)"
                          : "rgba(255,255,255,0.2)",
                      },
                    ]}
                  >
                    <Ionicons name="calendar-outline" size={12} color="#fff" />
                    <Text style={st.chipTxt}>
                      {new Date(submission.submissionDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </Text>
                  </View>
                  <View
                    style={[st.statusBadge, { backgroundColor: STATUS.bg }]}
                  >
                    <Text style={[st.statusTxt, { color: STATUS.fg }]}>
                      {STATUS.text}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Description */}
            {!!submission.description && (
              <View style={[st.section, st.sectionTight]}>
                <Text style={[st.sectionTitle, { color: C.foreground }]}>
                  Mô tả
                </Text>
                <Text style={[st.desc, { color: C.mutedForeground }]}>
                  {String(submission.description).trim()}
                </Text>
              </View>
            )}

            {/* Evaluations */}
            <View style={[st.section, st.sectionTight]}>
              <View style={st.evalHeader}>
                <Text style={[st.sectionTitle, { color: C.foreground }]}>
                  Đánh giá từ Ban Giám khảo
                </Text>
                <View style={st.avgBox}>
                  <Ionicons name="star" size={14} color={"#f59e0b"} />
                  <Text style={st.avgTxt}>{averageScore}/10</Text>
                </View>
              </View>

              {isLoading ? (
                <View style={st.skeletonWrap}>
                  <ActivityIndicator size="small" color={C.primary} />
                  <Text style={[st.loadingTxt, { color: C.mutedForeground }]}>
                    Đang tải đánh giá…
                  </Text>
                </View>
              ) : evaluations?.length ? (
                evaluations.map((e) => (
                  <View
                    key={e.id}
                    style={[
                      st.evalCard,
                      { borderColor: isDark ? "#1f2937" : "#e5e7eb" },
                    ]}
                  >
                    <View style={st.evalTopRow}>
                      <View style={st.avatarRow}>
                        <Ionicons
                          name="person-circle-outline"
                          size={34}
                          color={C.primary}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[st.evalName, { color: C.foreground }]}
                            numberOfLines={1}
                          >
                            {e.examinerName}
                          </Text>
                          <Text
                            style={[st.evalDate, { color: C.mutedForeground }]}
                          >
                            {new Date(e.evaluationDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Text>
                        </View>
                      </View>
                      <LinearGradient
                        colors={[C.primary, C.accent ?? "#6366f1"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={st.scorePill}
                      >
                        <Text style={st.scoreTxt}>{e.score}/10</Text>
                      </LinearGradient>
                    </View>

                    {!!e.feedback && (
                      <Text style={[st.evalCmt, { color: C.foreground }]}>
                        {String(e.feedback).trim()}
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <View style={st.emptyEval}>
                  <Ionicons name="time-outline" size={44} color={C.muted} />
                  <Text style={[st.emptyTitle, { color: C.mutedForeground }]}>
                    Chưa có đánh giá
                  </Text>
                  <Text style={[st.emptySub, { color: C.muted }]}>
                    Bài dự thi đang được xem xét
                  </Text>
                </View>
              )}
            </View>
          </Animated.ScrollView>

          {/* Footer */}
          <View
            style={[
              st.footer,
              {
                backgroundColor: C.card,
                borderTopColor: C.border,
              },
            ]}
          >
            <TouchableOpacity
              onPress={closeSheet}
              activeOpacity={0.9}
              style={[st.ctaBtn, { backgroundColor: C.primary }]}
            >
              <Text style={[st.ctaTxt, { color: C.primaryForeground }]}>
                Đóng
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default SubmissionDetailsModal;

/* ====================== STYLES ====================== */
const st = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    width: "100%",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },

  /* Glass header floating */
  glassHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: "rgba(17,24,39,0.22)",
  },
  grabber: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 999,
    opacity: 0.9,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14.5,
    letterSpacing: 0.2,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Hero */
  heroWrap: {
    width: "100%",
    height: HERO_H,
    overflow: "hidden",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: "#0b1220",
  },
  heroImg: {
    width: SCREEN_W,
    height: HERO_H + 40,
  },
  heroInfo: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  chipsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipTxt: { color: "#fff", fontSize: 12.5, fontWeight: "800" },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 2,
  },
  statusTxt: { fontSize: 12, fontWeight: "900", letterSpacing: 0.3 },

  /* Sections */
  section: { paddingHorizontal: 14, paddingTop: 14 },
  sectionTight: { paddingBottom: 6 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  desc: { fontSize: 14, lineHeight: 20 },

  /* Evaluations */
  evalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  avgBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(245,158,11,0.14)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  avgTxt: { color: "#f59e0b", fontWeight: "900", fontSize: 13 },

  evalCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  evalTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  evalName: { fontSize: 15, fontWeight: "800" },
  evalDate: { fontSize: 12, marginTop: 2 },
  scorePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  scoreTxt: { color: "#fff", fontWeight: "900", fontSize: 13 },

  evalCmt: { fontSize: 14, lineHeight: 20, marginTop: 2 },

  /* Empty / Loading */
  skeletonWrap: { alignItems: "center", paddingVertical: 30 },
  loadingTxt: { marginTop: 10, fontWeight: "700" },
  emptyEval: { alignItems: "center", paddingVertical: 36 },
  emptyTitle: { marginTop: 10, fontSize: 15, fontWeight: "900" },
  emptySub: { marginTop: 4, fontSize: 13.5 },

  /* Footer */
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: FOOTER_H,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaBtn: {
    width: "92%",
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  ctaTxt: { fontSize: 15, fontWeight: "900", letterSpacing: 0.2 },
});
