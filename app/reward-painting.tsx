import { useContestById } from "@/apis/contest";
import ArtchainAnimation from "@/components/animations/ArtchainAnimation";
import UnifiedHeader from "@/components/headers/UnifiedHeader";
import { Colors, withOpacity } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Award } from "@/types/contest";
import { router, useLocalSearchParams } from "expo-router";
import { Calendar, Gift } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/** Format datetime helper */
const fmtDateTime = (isoStr?: string) => {
  if (!isoStr) return "—";
  const date = new Date(isoStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Format prize with VND currency */
const fmtPrize = (prizeStr?: string) => {
  if (!prizeStr) return "—";
  const amount = parseFloat(prizeStr);
  if (isNaN(amount)) return prizeStr;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

/** Status styling */
const getStatusStyle = (scheme: "light" | "dark") => {
  const C = Colors[scheme];
  return {
    ACTIVE: {
      bg: withOpacity(C.primary, 0.08),
      fg: "#16a34a",
      label: "Đang diễn ra",
    },
    UPCOMING: {
      bg: withOpacity(C.accent, 0.08),
      fg: "#f59e0b",
      label: "Sắp diễn ra",
    },
    ENDED: {
      bg: withOpacity(C.muted, 0.08),
      fg: "#64748b",
      label: "Đã kết thúc",
    },
  } as const;
};

export default function RewardPainting() {
  const { contestId } = useLocalSearchParams<{ contestId: string }>();
  const {
    data: contest,
    isLoading,
    error,
    refetch,
  } = useContestById(contestId);
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";

  const C = Colors[scheme];
  const s = useMemo(() => styles(C), [C]);

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
    return "UPCOMING";
  };

  const tone = useMemo(
    () => getStatusStyle(scheme)[normalizeStatus(contest?.status)],
    [contest?.status, scheme],
  );

  const awards = useMemo(() => {
    if (!contest?.awards || !Array.isArray(contest.awards)) return [];
    return [...contest.awards].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
  }, [contest?.awards]);

  // Guard: contestId is required
  if (!contestId) {
    return (
      <View style={[s.screen, s.center]}>
        <Text style={s.text}>không tìm thấy cuộc thi</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[s.screen, s.center]}>
        <ArtchainAnimation />
        <Text style={[s.muted, { marginTop: 10 }]}>đang tải…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[s.screen, s.center, { padding: 16 }]}>
        <Text style={[s.text, { marginBottom: 10 }]}>{error.message}</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => refetch()}>
          <Text style={s.primaryBtnText}>thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!contest) {
    return (
      <View style={[s.screen, s.center]}>
        <Text style={s.text}>không tìm thấy cuộc thi</Text>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      {/* Unified header with back button */}
      <UnifiedHeader
        title={"Giải Thưởng Cuộc Thi"}
        showBack={true}
        onBack={() => router.back()}
        scheme={scheme}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* OPTIONAL BANNER IMAGE */}
        {contest.bannerUrl && (
          <View style={s.bannerImageContainer}>
            <Image
              source={{ uri: contest.bannerUrl }}
              style={s.bannerImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* CONTEST INFO CARD */}
        <View style={[s.section, { marginTop: 16 }]}>
          <View
            style={[
              s.infoCard,
              { borderLeftColor: tone.fg, borderLeftWidth: 4 },
            ]}
          >
            <View style={s.infoRow}>
              <View style={[s.statusBadge, { backgroundColor: tone.fg }]}>
                <Text style={[s.statusLabel, { color: "#FFF" }]}>
                  {tone.label}
                </Text>
              </View>
            </View>

            <View style={[s.infoDivider, { backgroundColor: C.border }]} />

            <View style={s.infoRow}>
              <Calendar size={16} color={C.mutedForeground} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={s.infoLabel}>thời gian cuộc thi</Text>
                <Text style={s.infoValue}>
                  {fmtDateTime(contest.startDate)} →{" "}
                  {fmtDateTime(contest.endDate)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* AWARDS SECTION */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Gift size={20} color={C.primary} />
            <Text style={s.sectionTitle}>giải thưởng ({awards.length})</Text>
          </View>

          {awards.length === 0 ? (
            <View style={s.emptyState}>
              <Gift size={48} color={C.muted} />
              <Text style={[s.muted, { marginTop: 12, fontSize: 14 }]}>
                cuộc thi này chưa có giải thưởng
              </Text>
            </View>
          ) : (
            <>
              {/* TOP 3 AWARDS */}
              {awards.slice(0, 3).length > 0 && (
                <View style={s.top3Container}>
                  {/* RANK 1 - Full Width */}
                  {awards[0]?.rank === 1 && (
                    <AwardCardTop1 award={awards[0]} colors={C} styles={s} />
                  )}

                  {/* RANK 2 & 3 - Dual Layout */}
                  {awards.slice(1, 3).length > 0 && (
                    <View style={s.top23Row}>
                      {awards[1]?.rank === 2 && (
                        <AwardCardTop23
                          award={awards[1]}
                          colors={C}
                          styles={s}
                          rank="2nd"
                          style={{ marginRight: 6 }}
                        />
                      )}
                      {awards[2]?.rank === 3 && (
                        <AwardCardTop23
                          award={awards[2]}
                          colors={C}
                          styles={s}
                          rank="3rd"
                          style={{ marginLeft: 6 }}
                        />
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* OTHER AWARDS (Rank >= 4) */}
              {awards.slice(3).length > 0 && (
                <View style={s.otherAwardsSection}>
                  {awards.slice(3).map((award, index) => (
                    <AwardCardRegular
                      key={award.awardId}
                      award={award}
                      isLast={index === awards.slice(3).length - 1}
                      colors={C}
                      styles={s}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/** TOP 1 AWARD - Premium Card */
interface AwardCardTop1Props {
  award: Award;
  colors: typeof Colors.light;
  styles: ReturnType<typeof styles>;
}

function AwardCardTop1({ award, colors, styles: s }: AwardCardTop1Props) {
  return (
    <View style={s.top1Card}>
      {/* Gradient Header */}
      <View style={s.top1Header}>
        <Text style={s.top1Badge}>🥇 giải nhất</Text>
      </View>

      {/* Content */}
      <View style={s.top1Content}>
        <Text style={s.top1Name} numberOfLines={2}>
          {award.name || "—"}
        </Text>

        {award.description && (
          <Text style={[s.top1Desc, { marginTop: 10 }]} numberOfLines={2}>
            {award.description}
          </Text>
        )}

        {/* Prize & Quantity */}
        <View style={[s.top1StatsRow, { marginTop: 16 }]}>
          <View style={s.top1Stat}>
            <Text style={s.top1StatLabel}>số lượng</Text>
            <Text style={s.top1StatValue}>{award.quantity ?? 0}</Text>
          </View>
          <View style={s.top1Stat}>
            <Text style={s.top1StatLabel}>giá trị</Text>
            <Text style={s.top1PrizeValue}>{fmtPrize(award.prize)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/** TOP 2 & 3 AWARDS - Dual Card */
interface AwardCardTop23Props {
  award: Award;
  colors: typeof Colors.light;
  styles: ReturnType<typeof styles>;
  rank: "2nd" | "3rd";
  style?: any;
}

function AwardCardTop23({
  award,
  colors,
  styles: s,
  rank,
  style,
}: AwardCardTop23Props) {
  const isSilver = rank === "2nd";
  const badge = isSilver ? "🥈 giải nhì" : "🥉 giải ba";

  // Color for Rank 2 & 3
  const badgeBgColor = isSilver ? "#475569" : "#92400E"; // Slate vs Copper

  return (
    <View style={[s.top23Card, style]}>
      {/* Badge */}
      <View style={[s.top23Badge, { backgroundColor: badgeBgColor }]}>
        <Text style={s.top23BadgeText}>{badge}</Text>
      </View>

      {/* Content */}
      <View style={s.top23Content}>
        <Text style={s.top23Name} numberOfLines={2}>
          {award.name || "—"}
        </Text>

        {award.description && (
          <Text style={[s.top23Desc, { marginTop: 6 }]} numberOfLines={1}>
            {award.description}
          </Text>
        )}

        {/* Stats */}
        <View style={[s.top23StatsRow, { marginTop: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.top23StatLabel}>số lượng</Text>
            <Text style={s.top23StatValue}>{award.quantity ?? 0}</Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={s.top23StatLabel}>giá trị</Text>
            <Text style={s.top23StatValue}>{fmtPrize(award.prize)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/** REGULAR AWARDS (Rank >= 4) */
interface AwardCardRegularProps {
  award: Award;
  isLast: boolean;
  colors: typeof Colors.light;
  styles: ReturnType<typeof styles>;
}

function AwardCardRegular({
  award,
  isLast,
  colors,
  styles: s,
}: AwardCardRegularProps) {
  return (
    <View
      style={[
        s.regularAwardCard,
        !isLast && { borderBottomColor: colors.border, borderBottomWidth: 1 },
      ]}
    >
      {/* Award Info */}
      <View style={s.regularAwardInfo}>
        <Text style={s.regularAwardName} numberOfLines={2}>
          Giải : {award.name || "—"}
        </Text>

        {award.description && (
          <Text
            style={[s.regularAwardDesc, { marginTop: 4 }]}
            numberOfLines={1}
          >
            {award.description}
          </Text>
        )}

        {/* Stats Row */}
        <View style={[s.regularStatsRow, { marginTop: 8 }]}>
          <View style={s.regularStat}>
            <Text style={s.regularStatLabel}>số lượng</Text>
            <Text style={s.regularStatValue}>{award.quantity ?? 0}</Text>
          </View>

          <View style={s.regularStat}>
            <Text style={s.regularStatLabel}>giá trị</Text>
            <Text style={s.regularStatValue}>{fmtPrize(award.prize)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      justifyContent: "center",
      alignItems: "center",
    },
    muted: {
      color: colors.mutedForeground,
      fontSize: 14,
      fontWeight: "500",
    },
    text: {
      color: colors.foreground,
      fontSize: 16,
      fontWeight: "600",
    },
    primaryBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    primaryBtnText: {
      color: colors.primaryForeground,
      fontSize: 14,
      fontWeight: "600",
    },

    // Banner image (optional visual)
    bannerImageContainer: {
      width: "100%",
      height: 180,
      backgroundColor: colors.muted,
      overflow: "hidden",
    },
    bannerImage: {
      width: "100%",
      height: "100%",
    },

    // Sections
    section: {
      paddingHorizontal: 16,
      marginTop: 28,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.foreground,
     
      letterSpacing: 0.3,
    },

    // Info Card
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    infoDivider: {
      height: 1,
      marginVertical: 12,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      alignSelf: "flex-start",
    },
    statusLabel: {
      fontSize: 12,
      fontWeight: "700",
    },
    infoLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontWeight: "500",
      textTransform: "lowercase",
    },
    infoValue: {
      fontSize: 13,
      color: colors.foreground,
      fontWeight: "600",
      marginTop: 4,
    },

    // Empty State
    emptyState: {
      paddingVertical: 40,
      alignItems: "center",
      justifyContent: "center",
    },

    // TOP 3 CONTAINER
    top3Container: {
      gap: 16,
    },

    // ===== TOP 1 CARD - GOLD (Rank 1) =====
    top1Card: {
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: "#FFFBEB", // Soft warm cream
      shadowColor: "#D97706",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 8,
      borderWidth: 1,
      borderColor: "#FEF3C7",
    },
    top1Header: {
      backgroundColor: "#D97706", // Medium gold (not bright)
      paddingVertical: 16,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    top1Badge: {
      fontSize: 16,
      fontWeight: "800",
      color: "#FFF",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    top1Content: {
      paddingHorizontal: 20,
      paddingVertical: 18,
    },
    top1Name: {
      fontSize: 19,
      fontWeight: "800",
      color: "#1F2937", // Dark text on light bg - excellent contrast
      lineHeight: 26,
      textTransform: "lowercase",
      letterSpacing: 0.2,
    },
    top1Desc: {
      fontSize: 13,
      color: "#6B7280", // Gray - secondary text, still readable
      fontWeight: "500",
      lineHeight: 18,
    },
    top1StatsRow: {
      flexDirection: "row",
      gap: 12,
    },
    top1Stat: {
      flex: 1,
      backgroundColor: "#FEF3C7", // Light gold bg
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#FCD34D",
    },
    top1StatLabel: {
      fontSize: 10,
      color: "#6B7280",
      fontWeight: "600",
      textTransform: "lowercase",
      marginBottom: 4,
      letterSpacing: 0.2,
    },
    top1StatValue: {
      fontSize: 17,
      fontWeight: "800",
      color: "#B45309", // Dark gold for better contrast on light bg
    },
    top1PrizeValue: {
      fontSize: 17,
      fontWeight: "800",
      color: "#92400E", // Even darker for prize emphasis
    },

    // ===== TOP 2 & 3 ROW =====
    top23Row: {
      flexDirection: "row",
      gap: 0,
    },

    // ===== TOP 2 CARD - SLATE (Rank 2) =====
    top23Card: {
      flex: 1,
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: "#F9FAFB", // Near white, very light
      borderWidth: 1,
      borderColor: "#E5E7EB",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 4,
    },
    top23Badge: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    top23BadgeText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#FFF",
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },
    top23Content: {
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    top23Name: {
      fontSize: 15,
      fontWeight: "700",
      color: "#1F2937", // Dark text - excellent contrast on light bg
      lineHeight: 21,
      textTransform: "lowercase",
    },
    top23Desc: {
      fontSize: 11,
      color: "#6B7280", // Secondary gray text
      fontWeight: "500",
      lineHeight: 15,
    },
    top23StatsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    top23StatLabel: {
      fontSize: 9,
      color: "#6B7280",
      fontWeight: "600",
      textTransform: "lowercase",
      marginBottom: 3,
      letterSpacing: 0.2,
    },
    top23StatValue: {
      fontSize: 14,
      fontWeight: "700",
      color: "#1F2937", // Dark text on light - good contrast
    },

    // ===== REGULAR AWARDS (Rank >= 4) =====
    otherAwardsSection: {
      marginTop: 16,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "#E5E7EB",
      backgroundColor: colors.card,
    },
    regularAwardCard: {
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      alignItems: "flex-start",
    },
    regularRankBadge: {
      minWidth: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: "#9CA3AF", // Medium gray (professional, not too bright)
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 6,
    },
    regularRankLabel: {
      color: "#FFF",
      fontSize: 10,
      fontWeight: "700",
      textAlign: "center",
      lineHeight: 12,
      
    },
    regularAwardInfo: {
      flex: 1,
    },
    regularAwardName: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1F2937",
    
      lineHeight: 18,
    },
    regularAwardDesc: {
      fontSize: 11,
      color: "#6B7280",
      fontWeight: "500",
      lineHeight: 15,
    },
    regularStatsRow: {
      flexDirection: "row",
      gap: 8,
    },
    regularStat: {
      flex: 1,
      paddingHorizontal: 8,
      paddingVertical: 6,
      backgroundColor: "#F3F4F6",
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      alignItems: "center",
    },
    regularStatLabel: {
      fontSize: 9,
      color: "#6B7280",
      fontWeight: "600",
      textTransform: "lowercase",
      marginBottom: 2,
    },
    regularStatValue: {
      fontSize: 12,
      fontWeight: "700",
      color: "#1F2937",
    },
  });
