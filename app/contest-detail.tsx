// app/contest-detail.tsx
import { useWhoAmI } from "@/apis/auth";
import { useCheckUploadCompetitor, useContestById } from "@/apis/contest";
import ArtchainAnimation from "@/components/animations/ArtchainAnimation";
import UnifiedHeader from "@/components/headers/UnifiedHeader";
import { Colors, withOpacity } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Rounds } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import { ExternalLink, FileText, Trophy, Users } from "lucide-react-native";
import React from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/** Status tone using app theme colors - more visible */
const getStatusStyle = (scheme: "light" | "dark") => {
  const C = Colors[scheme];
  return {
    ACTIVE: {
      bg: withOpacity(C.primary, 0.05),
      fg: "#16a34a", // green
      bd: withOpacity(C.primary, 0.2),
      label: "Đang diễn ra",
    },
    UPCOMING: {
      bg: withOpacity(C.accent, 0.05),
      fg: "#f59e0b", // amber
      bd: withOpacity(C.accent, 0.2),
      label: "Sắp diễn ra",
    },
    ENDED: {
      bg: withOpacity(C.muted, 0.05),
      fg: "#64748b", // slate
      bd: withOpacity(C.muted, 0.2),
      label: "Đã kết thúc",
    },
  } as const;
};

export default function ContestDetail() {
  const { contestId } = useLocalSearchParams<{ contestId: string }>();
  const {
    data: contest,
    isLoading,
    error,
    refetch,
  } = useContestById(contestId);
  const { data: me } = useWhoAmI();
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";

  const C = Colors[scheme];
  const s = styles(C);

  const { data: uploadStatus, isLoading: isCheckingUpload } =
    useCheckUploadCompetitor(
      contest?.contestId,
      me?.role === "COMPETITOR" && me?.userId ? [me.userId] : [],
    );

  const hasUploaded = uploadStatus?.[0]?.isUploaded === true;

  const isCompetitor = me?.role === "COMPETITOR";
  const disableJoin = isCompetitor && hasUploaded;

  if (isLoading) {
    return (
      <View style={[s.screen, s.center]}>
        <ArtchainAnimation />
        <Text style={[s.muted, { marginTop: 10 }]}>Đang tải…</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={[s.screen, s.center, { padding: 16 }]}>
        <Text style={[s.text, { marginBottom: 10 }]}>{error.message}</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => refetch()}>
          <Text style={s.primaryBtnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Normalize status to match our expected values
  const normalizeStatus = (
    status?: string,
  ): "ACTIVE" | "UPCOMING" | "ENDED" => {
    if (!status) return "UPCOMING";
    const upperStatus = status.toUpperCase();
    if (
      upperStatus === "ACTIVE" ||
      upperStatus === "ONGOING" ||
      upperStatus === "RUNNING"
    )
      return "ACTIVE";
    if (
      upperStatus === "UPCOMING" ||
      upperStatus === "PENDING" ||
      upperStatus === "SCHEDULED"
    )
      return "UPCOMING";
    if (
      upperStatus === "ENDED" ||
      upperStatus === "FINISHED" ||
      upperStatus === "COMPLETED" ||
      upperStatus === "CLOSED"
    )
      return "ENDED";
    return "UPCOMING"; // default fallback
  };

  const tone = getStatusStyle(scheme)[normalizeStatus(contest?.status)];

  // Get ROUND_1 and ROUND_2 data
  const findRound1 = (rounds?: Rounds[]) => {
    if (!rounds || !Array.isArray(rounds)) return null;
    return rounds.find((r) => r?.name === "ROUND_1") || null;
  };

  const findRound2 = (rounds?: Rounds[]) => {
    if (!rounds || !Array.isArray(rounds)) return null;
    return rounds.find((r) => r?.name === "ROUND_2") || null;
  };

  const round1 = findRound1(contest?.rounds);
  return (
    <View style={s.screen}>
      {/* Unified header with back button */}
      <UnifiedHeader
        title="Chi tiết Cuộc Thi"
        showBack={true}
        onBack={() => router.back()}
        scheme={scheme}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* HERO BANNER */}
        <View style={s.heroContainer}>
          <Image
            source={{ uri: contest?.bannerUrl }}
            style={s.heroImage}
            resizeMode="cover"
          />
          <View style={s.heroOverlay}>
            <Text style={s.heroTitle}>{contest?.title}</Text>
            {!!(contest as any)?.subTitle && (
              <Text style={s.heroSubtitle}>{(contest as any)?.subTitle}</Text>
            )}
          </View>
        </View>

        {/* KEY INFO CARDS */}
        <View style={s.infoCardsContainer}>
          <View style={s.infoCard}>
            <Trophy size={20} color={C.primary} />
            <Text style={s.infoCardValue}>{contest?.numOfAward ?? 0}</Text>
            <Text style={s.infoCardLabel}>Giải thưởng</Text>
          </View>

          <View style={s.infoCard}>
            <Users size={20} color={C.primary} />
            <Text style={s.infoCardValue}>{contest?.round2Quantity ?? 0}</Text>
            <Text style={s.infoCardLabel}>Vào vòng 2</Text>
          </View>
        </View>

        {/* CONTEST TIMELINE */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Thời gian cuộc thi</Text>
          </View>

          <View style={s.timelineContainer}>
            <View style={s.timelineItem}>
              <View style={[s.timelineDot, { backgroundColor: "#16a34a" }]} />
              <View style={s.timelineContent}>
                <Text style={s.timelineLabel}>Bắt đầu</Text>
                <Text style={s.timelineValue}>
                  {fmtDateTime(contest?.startDate) ?? "—"}
                </Text>
              </View>
            </View>

            <View style={s.timelineItem}>
              <View style={[s.timelineDot, { backgroundColor: "#dc2626" }]} />
              <View style={s.timelineContent}>
                <Text style={s.timelineLabel}>Kết thúc</Text>
                <Text style={s.timelineValue}>
                  {fmtDateTime(contest?.endDate) ?? "—"}
                </Text>
              </View>
            </View>

            <View
              style={[s.timelineItem, s.timelineItemLast, { marginTop: 16 }]}
            >
              <View style={[s.timelineDot, { backgroundColor: tone.fg }]} />
              <View style={s.timelineContent}>
                <Text style={s.timelineLabel}>Trạng thái</Text>
                <Text style={[s.timelineValue, { color: tone.fg }]}>
                  {tone.label}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ROUND 1 TIMELINE - Always show */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Lịch trình Vòng 1</Text>
          </View>

          <View style={s.roundTimeline}>
            <View style={s.roundItem}>
              <View style={[s.roundDot, { backgroundColor: C.primary }]} />
              <View style={s.roundContent}>
                <Text style={s.roundTitle}>Bắt đầu</Text>
                <Text style={s.roundDate}>
                  {round1
                    ? (fmtDateTime(round1.startDate) ?? "—")
                    : "Chưa có thông tin"}
                </Text>
              </View>
            </View>

            <View style={s.roundItem}>
              <View style={[s.roundDot, { backgroundColor: C.accent }]} />
              <View style={s.roundContent}>
                <Text style={s.roundTitle}>Hạn nộp bài</Text>
                <Text style={s.roundDate}>
                  {round1
                    ? (fmtDateTime(round1.submissionDeadline) ?? "—")
                    : "Chưa có thông tin"}
                </Text>
              </View>
            </View>

            <View style={s.roundItem}>
              <View style={[s.roundDot, { backgroundColor: C.secondary }]} />
              <View style={s.roundContent}>
                <Text style={s.roundTitle}>Công bố kết quả</Text>
                <Text style={s.roundDate}>
                  {round1
                    ? (fmtDateTime(round1.resultAnnounceDate) ?? "—")
                    : "Chưa có thông tin"}
                </Text>
              </View>
            </View>

            <View style={s.roundItem}>
              <View style={[s.roundDot, { backgroundColor: C.destructive }]} />
              <View style={s.roundContent}>
                <Text style={s.roundTitle}>Gửi bản gốc</Text>
                <Text style={s.roundDate}>
                  {round1
                    ? (fmtDateTime(round1.sendOriginalDeadline) ?? "—")
                    : "Chưa có thông tin"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ROUND 2 INFO */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Vòng 2</Text>
          </View>

          <View style={s.roundTimeline}>
            <View style={s.roundItem}>
              <View style={[s.roundDot, { backgroundColor: C.primary }]} />
              <View style={s.roundContent}>
                <Text style={s.roundTitle}>Số lượng tham gia</Text>
                <Text style={s.roundDate}>
                  Top {contest?.round2Quantity ?? 0} từ Vòng 1
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* RULES SECTION */}
        <View style={s.section}>
          <View style={[s.sectionHeader, { marginBottom: 8 }]}>
            <Text style={s.sectionTitle}>Thể lệ cuộc thi</Text>
          </View>

          {/* Rules PDF Link */}
          {contest?.ruleUrl && (
            <TouchableOpacity
              style={[s.actionButton, { marginBottom: 12 }]}
              onPress={() => Linking.openURL(contest.ruleUrl)}
              activeOpacity={0.9}
            >
              <FileText size={20} color={C.primary} />
              <Text style={s.actionButtonText}>Xem thể lệ chi tiết (PDF)</Text>
              <ExternalLink size={16} color={C.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* ACTION BUTTONS */}
        <View style={s.actionsContainer}>
          {/* See Rewards */}
          {["ACTIVE", "ENDED"].includes(contest!.status) && (
            <TouchableOpacity
              style={s.rewardsHighlightButton}
              onPress={() =>
                router.push({
                  pathname: "/reward-painting",
                  params: { contestId: String(contest!.contestId) },
                })
              }
              activeOpacity={0.85}
            >
              <Trophy size={22} color="white" />
              <Text style={s.rewardsHighlightButtonText}>Xem giải thưởng</Text>
              <View style={{ width: 22 }} />
            </TouchableOpacity>
          )}

          {contest?.status === "ACTIVE" && (
            <TouchableOpacity
              style={[s.primaryButton, disableJoin && s.primaryButtonDisabled]}
              disabled={disableJoin}
              onPress={() => {
                if (!me) {
                  router.push("/login");
                  return;
                }

                if (disableJoin) return;

                if (me.role === "COMPETITOR") {
                  const round1Data = findRound1(contest.rounds);
                  router.push({
                    pathname: "/painting-upload",
                    params: {
                      type: "COMPETITOR",
                      contestId: contest.contestId,
                      competitorId: me.userId,
                      roundId: round1Data?.roundId,
                    },
                  });
                  return;
                }

                if (me.role === "GUARDIAN") {
                  const round1Data = findRound1(contest.rounds);
                  router.push({
                    pathname: "/children-participate",
                    params: {
                      contestId: contest.contestId,
                      roundId: round1Data?.roundId,
                    },
                  });
                }
              }}
            >
              <Text style={s.primaryButtonText}>
                {disableJoin
                  ? "Bạn đã nộp bài cuộc thi này"
                  : "Tham gia cuộc thi"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- Helpers ---------------- */
function fmtDateTime(v?: string | Date | null) {
  if (!v) return undefined;
  try {
    const d = new Date(v);
    const date = d.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${date}`;
  } catch {
    return undefined;
  }
}

/* ---------------- Styles ---------------- */
const styles = (C: any) => {
  const R = 8; // ít bo tròn hơn
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.background },
    primaryButton: {
      backgroundColor: C.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
    },
    primaryButtonDisabled: {
      opacity: 0.5,
    },

    // HERO BANNER
    heroContainer: {
      height: 280,
      position: "relative",
      marginBottom: 20,
    },
    heroImage: {
      width: "100%",
      height: "100%",
    },
    heroOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      padding: 20,
    },
    heroTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "white",
      marginBottom: 4,
      fontFamily: "Be Vietnam Pro",
    },
    heroSubtitle: {
      fontSize: 16,
      color: "rgba(255,255,255,0.9)",
      fontFamily: "Be Vietnam Pro",
    },
    // INFO BAR
    infoBar: {
      flexDirection: "column",
      backgroundColor: C.card,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.border,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 8,
      fontFamily: "Be Vietnam Pro",
    },
    infoBarItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      minWidth: 80,
      fontFamily: "Be Vietnam Pro",
    },
    infoBarItemLast: {
      marginLeft: 0,
    },
    infoBarText: {
      fontSize: 14,
      fontWeight: "500",
      color: C.foreground,
      textAlign: "center",
      fontFamily: "Be Vietnam Pro",
    },
    statusDotSmall: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    // INFO CARDS
    infoCardsContainer: {
      flexDirection: "row",
      paddingHorizontal: 16,
      marginBottom: 24,
      gap: 12,
      fontFamily: "Be Vietnam Pro",
    },
    infoCard: {
      flex: 1,
      backgroundColor: C.card,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: C.border,
      gap: 8,
      fontFamily: "Be Vietnam Pro",
    },
    infoCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 8,
      fontFamily: "Be Vietnam Pro",
    },
    infoCardTitle: {
      fontSize: 12,
      color: C.mutedForeground,
      fontWeight: "400",
      fontFamily: "Be Vietnam Pro",
    },
    infoCardValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: C.foreground,
      fontFamily: "Be Vietnam Pro",
    },
    infoCardLabel: {
      fontSize: 11,
      color: C.mutedForeground,
      fontWeight: "500",
      textAlign: "center",
      fontFamily: "Be Vietnam Pro",
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      fontFamily: "Be Vietnam Pro",
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: "500",
      fontFamily: "Be Vietnam Pro",
    },
    // SECTIONS
    section: {
      marginBottom: 24,
      paddingHorizontal: 16,
    },
    sectionHeader: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: C.foreground,
    },
    // TIMELINE
    timelineContainer: {
      backgroundColor: C.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: C.border,
    },
    timelineItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    timelineItemLast: {
      marginBottom: 0,
    },
    timelineDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 12,
    },
    timelineContent: {
      flex: 1,
    },
    timelineLabel: {
      fontSize: 14,
      color: C.mutedForeground,
      marginBottom: 2,
    },
    timelineValue: {
      fontSize: 16,
      fontWeight: "500",
      color: C.foreground,
    },
    // ROUND TIMELINE
    roundTimeline: {
      backgroundColor: C.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingTop: 16,
      borderWidth: 1,
      borderColor: C.border,
    },
    roundItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    roundItemLast: {
      marginBottom: 0,
    },
    roundDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 12,
    },
    roundContent: {
      flex: 1,
    },
    roundTitle: {
      fontSize: 14,
      color: C.mutedForeground,
      marginBottom: 2,
      fontFamily: "Be Vietnam Pro",
    },
    roundDate: {
      fontSize: 15,
      fontWeight: "500",
      color: C.foreground,
      fontFamily: "Be Vietnam Pro",
    },
    // ACTIONS
    actionsContainer: {
      paddingHorizontal: 16,
      marginBottom: 24,
      gap: 12,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: C.border,
      gap: 12,
    },
    actionButtonText: {
      flex: 1,
      fontSize: 16,
      fontWeight: "500",
      color: C.foreground,
      fontFamily: "Be Vietnam Pro",
    },
    rewardsButton: {
      backgroundColor: C.accent,
    },
    rewardsButtonText: {
      color: C.accentForeground,
    },
    rewardsHighlightButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      backgroundColor: "#ff9500",
      borderRadius: 8,
      paddingVertical: 16,
      paddingHorizontal: 24,
      marginHorizontal: 16,
      marginVertical: 12,
      shadowColor: "#ff9500",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 8,
    },
    rewardsHighlightButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#ffffff",
      fontFamily: "Be Vietnam Pro",
      textAlign: "center",
    },

    primaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: C.primaryForeground,
      fontFamily: "Be Vietnam Pro",
    },
    // RULES
    rulesContainer: {
      backgroundColor: C.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: C.border,
    },
    ruleItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    ruleItemLast: {
      marginBottom: 0,
    },
    ruleBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: C.primary,
      marginTop: 6,
      marginRight: 12,
    },
    ruleText: {
      flex: 1,
      fontSize: 14,
      color: C.foreground,
      lineHeight: 20,
    },

    // LEGACY STYLES (keeping for compatibility)
    card: {
      backgroundColor: C.card,
      borderRadius: R,
      borderWidth: 1,
      borderColor: C.border,
      marginBottom: 16,
      overflow: "hidden",
    },
    cover: { width: "100%", height: 200 },
    metaGrid: {
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    metaBox: {
      flex: 1,
      backgroundColor: C.input,
      borderRadius: R - 2,
      borderWidth: 1,
      borderColor: C.border,
      padding: 14,
    },
    metaLabel: { color: C.mutedForeground, fontWeight: "500", marginBottom: 4 },
    awardRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    metaValue: { color: C.foreground, fontSize: 18, fontWeight: "600" },
    statusContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    statusChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
    },
    dot: { width: 6, height: 6, borderRadius: 999 },
    statusText: { fontWeight: "600", fontSize: 14 },
    title: { color: C.foreground, fontSize: 20, fontWeight: "600" },
    subTitle: { marginTop: 4, color: C.mutedForeground },
    cardHeaderRow: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
      backgroundColor: C.card,
    },
    row: { flexDirection: "row", alignItems: "center", gap: 10 },
    led: { width: 10, height: 10, borderRadius: 999 },
    rowTitle: { color: C.foreground, fontWeight: "800", marginBottom: 2 },
    ruleRow: {
      flexDirection: "row",
      gap: 8,
      alignItems: "flex-start",
      marginTop: 10,
    },
    star: {
      width: 6,
      height: 6,
      borderRadius: 999,
      backgroundColor: C.primary,
      marginTop: 7,
    },
    primaryBtn: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: R,
    },
    primaryBtnText: { fontWeight: "900" },
    ctaBtn: {
      paddingVertical: 14,
      paddingHorizontal: 18,
      borderRadius: R,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      marginBottom: 12,
    },
    ctaText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    rewardsBox: {
      backgroundColor: C.card,
      borderRadius: R,
      padding: 16,
      alignItems: "center",
    },
    rewardsTitle: {
      color: C.foreground,
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 12,
      textAlign: "center",
    },
    rewardsBtn: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: R - 2,
      alignItems: "center",
      justifyContent: "center",
    },
    pdfBox: {
      backgroundColor: C.card,
      borderRadius: R,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: C.border,
    },
    pdfText: { flex: 1, fontWeight: "600", fontSize: 14 },
    text: { color: C.foreground },
    muted: { color: C.mutedForeground },
    center: { justifyContent: "center", alignItems: "center" },
  });
};
