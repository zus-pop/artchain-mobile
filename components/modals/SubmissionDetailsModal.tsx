import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import styles from "./style";

type Scheme = "light" | "dark";

type SubmissionShape = {
  paintingId: string;
  title: string;
  imageUrl: string;
  contest: {
    title: string;
    id: string;
  };
  submissionDate: string;
  status: string;
  description?: string;
  evaluations?: {
    id: string;
    examinerName: string;
    score: number;
    maxScore: number;
    comment: string;
    evaluationDate: string;
    criteria?: {
      creativity: number;
      technique: number;
      composition: number;
      originality: number;
    };
  }[];
};

type Props = {
  visible: boolean;
  onClose: () => void;
  scheme: Scheme;
  submission: SubmissionShape | null;
};

const { height: SCREEN_H } = Dimensions.get("window");
const SNAP = { OPEN: 0, DISMISS: SCREEN_H };
const DRAG_CLOSE_THRESHOLD = 120;
const VELOCITY_CLOSE_THRESHOLD = 1.0;
const FOOTER_H = 64;

const COLORFUL = {
  blue: { bg: "rgba(37, 99, 235, 0.12)", fg: "#2563EB" }, // indigo-600
  green: { bg: "rgba(5, 150, 105, 0.12)", fg: "#059669" }, // emerald-600
  purple: { bg: "rgba(147, 51, 234, 0.12)", fg: "#9333EA" }, // purple-600
  amber: { bg: "rgba(245, 158, 11, 0.12)", fg: "#F59E0B" }, // amber-500
  pink: { bg: "rgba(219, 39, 119, 0.12)", fg: "#DB2777" }, // pink-600
  sky: { bg: "rgba(2, 132, 199, 0.12)", fg: "#0284C7" }, // sky-600
  red: { bg: "rgba(239, 68, 68, 0.12)", fg: "#EF4444" }, // red-500
};

const SubmissionDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  scheme,
  submission,
}) => {
  const C = Colors[scheme];
  const s = styles(C);

  // positions
  const translateY = useRef(new Animated.Value(SNAP.DISMISS)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const dragOffset = useRef(0);
  const scrollYRef = useRef(0);

  // ---------- SHEET ANIM ----------
  const openSheet = useCallback(() => {
    translateY.setValue(SNAP.DISMISS);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: SNAP.OPEN,
        useNativeDriver: true,
        stiffness: 180,
        damping: 22,
        mass: 0.8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
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
        stiffness: 180,
        damping: 22,
        mass: 0.85,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dragOffset.current = SNAP.DISMISS;
      onClose();
    });
  }, [translateY, backdropOpacity, onClose]);

  const animateTo = useCallback(
    (to: number) => {
      if (to === SNAP.DISMISS) return closeSheet();
      Animated.spring(translateY, {
        toValue: to,
        useNativeDriver: true,
        stiffness: 180,
        damping: 22,
        mass: 0.8,
      }).start(() => (dragOffset.current = to));
    },
    [closeSheet, translateY]
  );

  useEffect(() => {
    if (visible) requestAnimationFrame(openSheet);
  }, [visible, openSheet]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => {
          const isVertical = Math.abs(g.dy) > Math.abs(g.dx);
          const pullingDown = g.dy > 5;
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

  const getStatusColor = (status: string) => {
    if (status === "WINNER" || status === "APPROVED") return COLORFUL.green.fg;
    if (status === "ACCEPTED" || status === "APPROVED") return COLORFUL.blue.fg;
    if (status === "REJECTED" || status === "DENIED") return COLORFUL.red.fg;
    if (status === "PENDING" || status === "REVIEWING")
      return COLORFUL.amber.fg;
    if (status === "SUBMITTED") return COLORFUL.sky.fg;
    return C.mutedForeground;
  };

  const getStatusText = (status: string) => {
    if (status === "WINNER" || status === "APPROVED") return "Giải thưởng";
    if (status === "ACCEPTED" || status === "APPROVED") return "Được chấp nhận";
    if (status === "REJECTED" || status === "DENIED") return "Bị từ chối";
    if (status === "PENDING" || status === "REVIEWING") return "Đang xử lý";
    if (status === "SUBMITTED") return "Đã nộp";
    return "Không xác định";
  };

  const getStatusBg = (status: string) => {
    if (status === "WINNER" || status === "APPROVED") return COLORFUL.green.bg;
    if (status === "ACCEPTED" || status === "APPROVED") return COLORFUL.blue.bg;
    if (status === "REJECTED" || status === "DENIED") return COLORFUL.red.bg;
    if (status === "PENDING" || status === "REVIEWING")
      return COLORFUL.amber.bg;
    if (status === "SUBMITTED") return COLORFUL.sky.bg;
    return C.muted + "40";
  };

  const averageScore = useMemo(() => {
    if (!submission?.evaluations?.length) return 0;
    const total = submission.evaluations.reduce(
      (sum, foo) => sum + foo.score,
      0
    );
    return Math.round((total / submission.evaluations.length) * 10) / 10;
  }, [submission?.evaluations]);

  if (!visible || !submission) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      <View style={s.wrap}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={closeSheet}>
          <Animated.View style={[s.backdrop, { opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>

        {/* Bottom sheet */}
        <Animated.View
          style={[s.sheet, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          {/* Header */}
          <View>
            <View style={s.grabberWrap}>
              <View style={s.grabber} />
            </View>

            <View style={s.headerRow}>
              <Text style={s.title}>Chi tiết bài dự thi</Text>
              <TouchableOpacity
                onPress={closeSheet}
                style={s.iconBtn}
                activeOpacity={0.85}
              >
                <Ionicons name="close" size={22} color={COLORFUL.pink.fg} />
              </TouchableOpacity>
            </View>

            <View style={s.divider} />
          </View>

          {/* CONTENT */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: FOOTER_H + 16 }}
            keyboardShouldPersistTaps="handled"
            bounces
            scrollEventThrottle={16}
            onScroll={onScroll}
          >
            {/* SUBMISSION IMAGE */}
            <View style={local.imageContainer}>
              <Image
                source={{ uri: submission.imageUrl }}
                style={local.submissionImage}
                resizeMode="cover"
              />
            </View>

            <View style={s.divider} />

            {/* SUBMISSION INFO */}
            <View style={s.sectionTight}>
              <Text style={[s.sectionTitle, { color: C.foreground }]}>
                {submission.title}
              </Text>

              {submission.description && (
                <Text style={[local.description, { color: C.mutedForeground }]}>
                  {submission.description}
                </Text>
              )}

              <View style={local.metaRow}>
                <Ionicons name="trophy-outline" size={16} color={C.primary} />
                <Text style={[local.metaText, { color: C.primary }]}>
                  {submission.contest.title}
                </Text>
              </View>

              <View style={local.metaRow}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={C.mutedForeground}
                />
                <Text style={[local.metaText, { color: C.mutedForeground }]}>
                  Nộp ngày:{" "}
                  {new Date(submission.submissionDate).toLocaleDateString(
                    "vi-VN"
                  )}
                </Text>
              </View>

              <View style={local.statusContainer}>
                <View
                  style={[
                    local.statusBadge,
                    { backgroundColor: getStatusBg(submission.status) },
                  ]}
                >
                  <Text
                    style={[
                      local.statusText,
                      { color: getStatusColor(submission.status) },
                    ]}
                  >
                    {getStatusText(submission.status)}
                  </Text>
                </View>
              </View>
            </View>

            {/* EVALUATIONS SECTION */}
            {submission.evaluations && submission.evaluations.length > 0 && (
              <>
                <View style={s.divider} />
                <View style={s.sectionTight}>
                  <View style={local.evaluationHeader}>
                    <Text style={[s.sectionTitle, { color: C.foreground }]}>
                      Đánh giá từ Ban Giám khảo
                    </Text>
                    <View style={local.averageScore}>
                      <Ionicons
                        name="star"
                        size={16}
                        color={COLORFUL.amber.fg}
                      />
                      <Text
                        style={[
                          local.averageScoreText,
                          { color: COLORFUL.amber.fg },
                        ]}
                      >
                        {averageScore}/
                        {submission.evaluations[0]?.maxScore || 100}
                      </Text>
                    </View>
                  </View>

                  {submission.evaluations.map((evaluation, index) => (
                    <View key={evaluation.id} style={local.evaluationCard}>
                      <View style={local.evaluationHeaderRow}>
                        <View style={local.examinerInfo}>
                          <Ionicons
                            name="person-circle-outline"
                            size={24}
                            color={C.primary}
                          />
                          <View>
                            <Text
                              style={[
                                local.examinerName,
                                { color: C.foreground },
                              ]}
                            >
                              {evaluation.examinerName}
                            </Text>
                            <Text
                              style={[
                                local.evaluationDate,
                                { color: C.mutedForeground },
                              ]}
                            >
                              {new Date(
                                evaluation.evaluationDate
                              ).toLocaleDateString("vi-VN")}
                            </Text>
                          </View>
                        </View>
                        <View style={local.scoreContainer}>
                          <Text style={[local.scoreText, { color: C.primary }]}>
                            {evaluation.score}/{evaluation.maxScore}
                          </Text>
                        </View>
                      </View>

                      {evaluation.comment && (
                        <Text style={[local.comment, { color: C.foreground }]}>
                          {evaluation.comment}
                        </Text>
                      )}

                      {evaluation.criteria && (
                        <View style={local.criteriaContainer}>
                          <Text
                            style={[
                              local.criteriaTitle,
                              { color: C.mutedForeground },
                            ]}
                          >
                            Chi tiết đánh giá:
                          </Text>
                          <View style={local.criteriaGrid}>
                            <View style={local.criterion}>
                              <Text
                                style={[
                                  local.criterionLabel,
                                  { color: C.mutedForeground },
                                ]}
                              >
                                Sáng tạo
                              </Text>
                              <Text
                                style={[
                                  local.criterionValue,
                                  { color: C.foreground },
                                ]}
                              >
                                {evaluation.criteria.creativity}/10
                              </Text>
                            </View>
                            <View style={local.criterion}>
                              <Text
                                style={[
                                  local.criterionLabel,
                                  { color: C.mutedForeground },
                                ]}
                              >
                                Kỹ thuật
                              </Text>
                              <Text
                                style={[
                                  local.criterionValue,
                                  { color: C.foreground },
                                ]}
                              >
                                {evaluation.criteria.technique}/10
                              </Text>
                            </View>
                            <View style={local.criterion}>
                              <Text
                                style={[
                                  local.criterionLabel,
                                  { color: C.mutedForeground },
                                ]}
                              >
                                Bố cục
                              </Text>
                              <Text
                                style={[
                                  local.criterionValue,
                                  { color: C.foreground },
                                ]}
                              >
                                {evaluation.criteria.composition}/10
                              </Text>
                            </View>
                            <View style={local.criterion}>
                              <Text
                                style={[
                                  local.criterionLabel,
                                  { color: C.mutedForeground },
                                ]}
                              >
                                Tính độc đáo
                              </Text>
                              <Text
                                style={[
                                  local.criterionValue,
                                  { color: C.foreground },
                                ]}
                              >
                                {evaluation.criteria.originality}/10
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* NO EVALUATIONS YET */}
            {(!submission.evaluations ||
              submission.evaluations.length === 0) && (
              <>
                <View style={s.divider} />
                <View style={s.sectionTight}>
                  <View style={local.noEvaluationContainer}>
                    <Ionicons name="time-outline" size={48} color={C.muted} />
                    <Text
                      style={[
                        local.noEvaluationText,
                        { color: C.mutedForeground },
                      ]}
                    >
                      Chưa có đánh giá từ Ban Giám khảo
                    </Text>
                    <Text
                      style={[local.noEvaluationSubtext, { color: C.muted }]}
                    >
                      Bài dự thi đang được xem xét và đánh giá
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* FOOTER STICKY */}
          <View
            style={[
              s.footer,
              {
                backgroundColor: C.card,
                borderTopColor: C.border,
              },
            ]}
          >
            <TouchableOpacity
              style={s.ghostBtn}
              onPress={closeSheet}
              activeOpacity={0.9}
            >
              <Text style={[s.ghostTxt, { color: COLORFUL.pink.fg }]}>
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

const local = StyleSheet.create({
  imageContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  submissionImage: {
    width: "90%",
    height: 250,
    borderRadius: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
  },
  statusContainer: {
    marginTop: 12,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  evaluationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  averageScore: {
    flexDirection: "row",
    alignItems: "center",
  },
  averageScoreText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 4,
  },
  evaluationCard: {
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  evaluationHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  examinerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  examinerName: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  evaluationDate: {
    fontSize: 12,
    marginLeft: 8,
    marginTop: 2,
  },
  scoreContainer: {
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  criteriaContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: 12,
  },
  criteriaTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  criteriaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  criterion: {
    flex: 1,
    minWidth: "45%",
  },
  criterionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  criterionValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  noEvaluationContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noEvaluationText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  noEvaluationSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});
