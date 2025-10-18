import { usePaintingEvaluations } from "@/apis/painting";
import { Colors } from "@/constants/theme";
import { Painting } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
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

type Props = {
  visible: boolean;
  onClose: () => void;
  scheme: Scheme;
  submission: Painting;
};

const { height: SCREEN_H } = Dimensions.get("window");
const SNAP = { OPEN: 0, DISMISS: SCREEN_H };
const DRAG_CLOSE_THRESHOLD = 120;
const VELOCITY_CLOSE_THRESHOLD = 1.0;
const FOOTER_H = 64;

const SubmissionDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  scheme,
  submission,
}) => {
  const { data: evaluations = [], isLoading } = usePaintingEvaluations(
    submission.paintingId
  );
  const C = Colors[scheme];
  const s = styles(C);

  const local = StyleSheet.create({
    imageContainer: {
      alignItems: "center",
      paddingVertical: 16,
    },
    submissionImage: {
      width: "100%",
      height: 250,
      borderRadius: 8,
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
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    evaluationHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
      gap: 20,
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
      marginRight: 15,
    },
    evaluationDate: {
      fontSize: 12,
      marginLeft: 8,
      marginTop: 2,
    },
    scoreContainer: {
      backgroundColor: C.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
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
    loadingContainer: {
      alignItems: "center",
      paddingVertical: 40,
    },
    loadingText: {
      fontSize: 16,
      fontWeight: "600",
      marginTop: 16,
      marginBottom: 8,
      textAlign: "center",
    },
    loadingSubtext: {
      fontSize: 14,
      textAlign: "center",
    },
  });

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
    if (status === "WINNER" || status === "APPROVED") return "#ffffff"; // White text on colored background
    if (status === "ACCEPTED" || status === "APPROVED") return "#ffffff"; // White text on colored background
    if (status === "REJECTED" || status === "DENIED") return "#ffffff"; // White text on colored background
    if (status === "PENDING" || status === "REVIEWING") return C.foreground; // Dark text on light background
    if (status === "SUBMITTED") return C.foreground; // Dark text on light background
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
    if (status === "WINNER" || status === "APPROVED") return C.accent;
    if (status === "ACCEPTED" || status === "APPROVED") return C.primary20;
    if (status === "REJECTED" || status === "DENIED") return C.destructive;
    if (status === "PENDING" || status === "REVIEWING") return C.chart3;
    if (status === "SUBMITTED") return C.muted;
    return C.muted;
  };

  const averageScore = useMemo(() => {
    if (evaluations.length === 0) return 0;
    const total = evaluations.reduce((sum, foo) => sum + foo.score, 0);
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
                <Ionicons name="close" size={22} color={C.mutedForeground} />
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
              <Text
                style={[s.sectionTitle, { color: C.foreground, fontSize: 20 }]}
              >
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
            {isLoading ? (
              <>
                <View style={s.divider} />
                <View style={s.sectionTight}>
                  <View style={local.loadingContainer}>
                    <ActivityIndicator size="large" color={C.primary} />
                    <Text style={[local.loadingText, { color: C.foreground }]}>
                      Đang tải đánh giá...
                    </Text>
                    <Text
                      style={[
                        local.loadingSubtext,
                        { color: C.mutedForeground },
                      ]}
                    >
                      Vui lòng đợi trong giây lát
                    </Text>
                  </View>
                </View>
              </>
            ) : evaluations && evaluations.length > 0 ? (
              <>
                <View style={s.divider} />
                <View style={s.sectionTight}>
                  <View style={local.evaluationHeader}>
                    <Text style={[s.sectionTitle, { color: C.foreground }]}>
                      Đánh giá từ Ban Giám khảo
                    </Text>
                    <View style={local.averageScore}>
                      <Ionicons name="star" size={16} color={C.chart3} />
                      <Text
                        style={[local.averageScoreText, { color: C.chart3 }]}
                      >
                        {averageScore}/10
                      </Text>
                    </View>
                  </View>

                  {evaluations.map((evaluation) => (
                    <View key={evaluation.id} style={local.evaluationCard}>
                      <View style={local.evaluationHeaderRow}>
                        <View style={local.examinerInfo}>
                          <Ionicons
                            name="person-circle-outline"
                            size={30}
                            color={C.primary}
                          />
                          <View>
                            <Text
                              style={[
                                local.examinerName,
                                { color: C.foreground },
                              ]}
                            >
                              {evaluation.examiner.examinerId}
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
                          <Text
                            style={[
                              local.scoreText,
                              { color: C.primaryForeground },
                            ]}
                          >
                            {evaluation.score}/10
                          </Text>
                        </View>
                      </View>

                      {evaluation.feedback && (
                        <Text style={[local.comment, { color: C.foreground }]}>
                          {evaluation.feedback}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </>
            ) : (
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
              style={[s.ghostBtn, { backgroundColor: C.primary }]}
              onPress={closeSheet}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  s.ghostTxt,
                  { color: C.primaryForeground, fontWeight: "800" },
                ]}
              >
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
