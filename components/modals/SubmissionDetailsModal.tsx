import { usePaintingEvaluations } from "@/apis/painting";
import { Colors } from "@/constants/theme";
import { Painting } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Scheme = "light" | "dark";

type Props = {
  visible: boolean;
  onClose: () => void;
  scheme: Scheme;
  submission: Painting;
};

const { height: SCREEN_H } = Dimensions.get("window");
const FOOTER_H = 70;
const HERO_H = Math.min(420, Math.max(320, SCREEN_H * 0.5));

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

  // Bottom sheet ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Snap points for the bottom sheet - use percentage
  const snapPoints = useMemo(() => ["94%"], []);

  // Control modal visibility with useEffect
  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  // ---------- Helpers: status mapping ----------
  const statusMap = useMemo(
    () => ({
      WINNER: { text: "Giải thưởng", bg: C.accent ?? "#22c55e", fg: "#fff" },
      APPROVED: { text: "Được duyệt", bg: C.primary ?? "#3b82f6", fg: "#fff" },
      ACCEPTED: {
        text: "Đã chấp nhận",
        bg: "#06d47eff",
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

  // ---------- Determine painting round ----------
  const paintingRound = useMemo(() => {
    if (!submission?.contest?.rounds) return null;
    return submission.contest.rounds.find(
      (r) => r.roundId === submission.roundId
    );
  }, [submission]);

  const isRound2 = paintingRound?.name === "ROUND_2";

  // ---------- Derived ----------
  const averageScore = useMemo(() => {
    if (!evaluations?.length) return 0;
    if (isRound2) {
      // For Round 2, calculate average of detailed scores
      const total = evaluations.reduce((sum, e) => {
        const scores = [
          e.creativityScore,
          e.compositionScore,
          e.colorScore,
          e.technicalScore,
          e.aestheticScore,
        ].filter((score) => score !== null && score !== undefined);
        return sum + (scores.reduce((a, b) => a + b, 0) / scores.length || 0);
      }, 0);
      return Math.round((total / evaluations.length) * 10) / 10;
    } else {
      // For Round 1, use scoreRound1
      const total = evaluations.reduce(
        (sum, e) => sum + (e.scoreRound1 ?? 0),
        0
      );
      return Math.round((total / evaluations.length) * 10) / 10;
    }
  }, [evaluations, isRound2]);
  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backgroundStyle={{ backgroundColor: C.card }}
      handleIndicatorStyle={{ backgroundColor: C.mutedForeground }}
      enablePanDownToClose={true}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      )}
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 14,
          paddingTop: 6,
        }}
        keyboardShouldPersistTaps="handled"
        bounces
      >
        {/* HERO image */}
        <View style={st.heroWrap}>
          <Image
            source={{ uri: submission.imageUrl }}
            resizeMode="cover"
            style={st.heroImg}
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
              <View style={[st.statusBadge, { backgroundColor: STATUS.bg }]}>
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
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Text
                          style={[st.evalDate, { color: C.mutedForeground }]}
                        >
                          {new Date(e.evaluationDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </Text>
                        {e.examiner?.specialization && (
                          <Text
                            style={[
                              st.evalSpecialization,
                              { color: C.mutedForeground },
                            ]}
                          >
                            • {e.examiner.specialization}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                  <LinearGradient
                    colors={[C.primary, C.accent ?? "#6366f1"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={st.scorePill}
                  >
                    <Text style={st.scoreTxt}>
                      {isRound2
                        ? (() => {
                            const scores = [
                              e.creativityScore,
                              e.compositionScore,
                              e.colorScore,
                              e.technicalScore,
                              e.aestheticScore,
                            ].filter(
                              (score) => score !== null && score !== undefined
                            );
                            const avg =
                              scores.reduce((a, b) => a + b, 0) / scores.length;
                            return Math.round(avg * 10) / 10;
                          })()
                        : e.scoreRound1}
                      /10
                    </Text>
                  </LinearGradient>
                </View>

                {/* Round 2 detailed scores */}
                {isRound2 && (
                  <View style={st.detailedScores}>
                    <View style={st.scoreRow}>
                      <Text
                        style={[st.scoreLabel, { color: C.mutedForeground }]}
                      >
                        Sáng tạo:
                      </Text>
                      <Text style={[st.scoreValue, { color: C.foreground }]}>
                        {e.creativityScore ?? "—"}/30
                      </Text>
                    </View>
                    <View style={st.scoreRow}>
                      <Text
                        style={[st.scoreLabel, { color: C.mutedForeground }]}
                      >
                        Bố cục:
                      </Text>
                      <Text style={[st.scoreValue, { color: C.foreground }]}>
                        {e.compositionScore ?? "—"}/20
                      </Text>
                    </View>
                    <View style={st.scoreRow}>
                      <Text
                        style={[st.scoreLabel, { color: C.mutedForeground }]}
                      >
                        Màu sắc:
                      </Text>
                      <Text style={[st.scoreValue, { color: C.foreground }]}>
                        {e.colorScore ?? "—"}/20
                      </Text>
                    </View>
                    <View style={st.scoreRow}>
                      <Text
                        style={[st.scoreLabel, { color: C.mutedForeground }]}
                      >
                        Kỹ thuật:
                      </Text>
                      <Text style={[st.scoreValue, { color: C.foreground }]}>
                        {e.technicalScore ?? "—"}/20
                      </Text>
                    </View>
                    <View style={st.scoreRow}>
                      <Text
                        style={[st.scoreLabel, { color: C.mutedForeground }]}
                      >
                        Thẩm mỹ:
                      </Text>
                      <Text style={[st.scoreValue, { color: C.foreground }]}>
                        {e.aestheticScore ?? "—"}/10
                      </Text>
                    </View>
                    <View style={[st.scoreRow, st.totalScoreRow]}>
                      <Text
                        style={[
                          st.scoreLabel,
                          { color: C.foreground, fontWeight: "800" },
                        ]}
                      >
                        Tổng điểm:
                      </Text>
                      <Text
                        style={[
                          st.scoreValue,
                          { color: C.primary, fontWeight: "900" },
                        ]}
                      >
                        {(() => {
                          const scores = [
                            e.creativityScore,
                            e.compositionScore,
                            e.colorScore,
                            e.technicalScore,
                            e.aestheticScore,
                          ].filter(
                            (score) => score !== null && score !== undefined
                          );
                          return scores.reduce((a, b) => a + b, 0);
                        })()}
                        /100
                      </Text>
                    </View>
                  </View>
                )}

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

        {/* Footer */}
        <View style={st.footerContainer}>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.9}
            style={[st.ctaBtn, { backgroundColor: C.primary }]}
          >
            <Text style={[st.ctaTxt, { color: C.primaryForeground }]}>
              Đóng
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default SubmissionDetailsModal;

/* ====================== STYLES ====================== */
const st = StyleSheet.create({
  /* Hero */
  heroWrap: {
    width: "100%",
    height: HERO_H,
    overflow: "hidden",
    backgroundColor: "#0b1220",
  },
  heroImg: {
    width: "100%",
    height: "100%",
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
  evalSpecialization: { fontSize: 13, fontWeight: "500" },
  evalDate: { fontSize: 12, marginTop: 2 },
  scorePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  scoreTxt: { color: "#fff", fontWeight: "900", fontSize: 13 },

  evalCmt: { fontSize: 14, lineHeight: 20, marginTop: 2 },

  /* Detailed Scores for Round 2 */
  detailedScores: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  totalScoreRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.15)",
  },
  scoreLabel: { fontSize: 13, fontWeight: "600" },
  scoreValue: { fontSize: 13, fontWeight: "700" },

  /* Empty / Loading */
  skeletonWrap: { alignItems: "center", paddingVertical: 30 },
  loadingTxt: { marginTop: 10, fontWeight: "700" },
  emptyEval: { alignItems: "center", paddingVertical: 36 },
  emptyTitle: { marginTop: 10, fontSize: 15, fontWeight: "900" },
  emptySub: { marginTop: 4, fontSize: 13.5 },

  /* Footer */
  footerContainer: {
    marginTop: 20,
    paddingHorizontal: 14,
    paddingBottom: 20,
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
