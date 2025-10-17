import PillButton from "@/components/buttons/PillButton";
import ProfileDetailsModal from "@/components/modals/ProfileDetailsModal";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ===== Types =====
import { useWhoAmI } from "@/apis/auth";
import { useAuthStore } from "@/store/auth-store";
import type { ColorTokens, KPIProps } from "@/types/tabkey";
import { formatDateDisplay } from "@/utils/date";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useMySubmission } from "../apis/painting";
import { Painting } from "../types";
import SubmissionDetailsModal from "./modals/SubmissionDetailsModal";

export default function CompetitorProfileComponent() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: user, isLoading, refetch: reloadMe } = useWhoAmI();
  const C = Colors[scheme];
  const s = styles(C);
  const { data: submissions = [], isLoading: submissionsLoading } =
    useMySubmission();
  const [openDetails, setOpenDetails] = useState(false);
  const [openSubmission, setOpenSubmission] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Painting | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "contests" | "achievements" | "submissions"
  >("contests");

  const ongoingContests = useMemo(
    () => [
      {
        id: "contest1",
        title: "Vẽ Sài Gòn Xanh",
        progress: 75,
        status: "active",
        deadline: "2024-12-31",
        submitted: true,
        submissionCount: 1,
        totalRounds: 2,
        currentRound: 1,
      },
      {
        id: "contest2",
        title: "Nghệ Thuật Đường Phố",
        progress: 45,
        status: "active",
        deadline: "2025-01-15",
        submitted: false,
        submissionCount: 0,
        totalRounds: 1,
        currentRound: 1,
      },
    ],
    []
  );

  // Calculate contest participation stats
  const contestStats = useMemo(() => {
    const activeContests = ongoingContests.length;
    const submittedContests = ongoingContests.filter((c) => c.submitted).length;
    const avgProgress =
      ongoingContests.length > 0
        ? Math.round(
            ongoingContests.reduce((sum, c) => sum + c.progress, 0) /
              ongoingContests.length
          )
        : 0;

    return {
      activeContests,
      submittedContests,
      avgProgress,
    };
  }, [ongoingContests]);

  const achievements = useMemo(
    () =>
      [
        {
          id: "a1",
          title: 'Giải Nhất "Cuộc thi vẽ tranh thiếu nhi toàn quốc 2024"',
          place: "2024 - TP. Hồ Chí Minh",
          awardId: "award_2024_001",
        },
        {
          id: "a2",
          title: 'Top 10 "Nghệ thuật đường phố TPHCM"',
          place: "2024 - Quận 1",
          awardId: "award_2024_002",
        },
        {
          id: "a3",
          title: "Participation Certificate",
          place: "2024 - District 3",
          awardId: null, // This should be filtered out
        },
      ].filter((achievement) => achievement.awardId !== null),
    []
  );

  const ICONS: Record<
    "brush" | "trophy" | "eye" | "heart",
    { fg: string; bg: string }
  > = {
    brush: { fg: "#F59E0B", bg: "rgba(245,158,11,0.14)" },
    trophy: { fg: "#EAB308", bg: "rgba(234,179,8,0.14)" },
    eye: { fg: "#3B82F6", bg: "rgba(59,130,246,0.14)" },
    heart: { fg: "#EF4444", bg: "rgba(239,68,68,0.14)" },
  };

  // Competitor KPIs
  const kpis = useMemo(
    () => [
      {
        icon: "brush-outline" as const,
        label: "Bài dự thi",
        value: String(submissions.length),
        iconColor: ICONS.brush.fg,
        iconBg: ICONS.brush.bg,
      },
      {
        icon: "trophy-outline" as const,
        label: "Giải thưởng",
        value: String(achievements.length),
        iconColor: ICONS.trophy.fg,
        iconBg: ICONS.trophy.bg,
      },
      {
        icon: "time-outline" as const,
        label: "Cuộc thi active",
        value: String(contestStats.activeContests),
        iconColor: "#8B5CF6",
        iconBg: "rgba(139,92,246,0.14)",
      },
    ],
    [submissions.length, achievements.length, contestStats, ICONS]
  );

  // Competitor tabs
  const tabs = useMemo(
    () => [
      { key: "contests", label: "Cuộc thi", icon: "time-outline" },
      { key: "achievements", label: "Thành tích", icon: "trophy-outline" },
      { key: "submissions", label: "Bài nộp", icon: "document-text-outline" },
    ],
    []
  );

  useFocusEffect(
    useCallback(() => {
      reloadMe();
    }, [])
  );

  const Avatar = () => (
    <View
      style={[s.avatar, { alignItems: "center", justifyContent: "center" }]}
    >
      <Ionicons name="person-outline" size={22} color={C.mutedForeground} />
    </View>
  );
  const scrollY = useRef(new Animated.Value(0)).current;

  if (isLoading) {
    return (
      <View style={s.container}>
        <View style={s.topbar}>
          <Text style={s.headerTitle}>Hồ sơ</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity style={s.iconBtn}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={C.foreground}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <Ionicons name="person-circle-outline" size={80} color={C.muted} />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: C.foreground,
              marginTop: 16,
            }}
          >
            Đang tải hồ sơ...
          </Text>
        </View>
      </View>
    );
  }

  if (!accessToken || !user) {
    return (
      <View style={s.container}>
        <View style={s.topbar}>
          <Text style={s.headerTitle}>Hồ sơ</Text>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <Ionicons name="person-circle-outline" size={80} color={C.muted} />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: C.foreground,
              marginTop: 16,
            }}
          >
            Bạn chưa đăng nhập
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: C.mutedForeground,
              marginVertical: 12,
              textAlign: "center",
            }}
          >
            Đăng nhập để quản lý hồ sơ, theo dõi thành tích và tham gia các cuộc
            thi nghệ thuật hấp dẫn trên ArtChain.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/login")}
            style={{
              backgroundColor: C.primary,
              borderRadius: 16,
              paddingHorizontal: 32,
              paddingVertical: 12,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: C.primaryForeground,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Đăng nhập / Đăng ký
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaProvider style={s.container}>
      {/* Top bar */}
      <View style={s.topbar}>
        <Text style={s.headerTitle}>Hồ sơ thí sinh</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => router.push("/notifications")}
            style={s.iconBtn}
          >
            <Ionicons
              name="notifications-outline"
              size={25}
              color={C.foreground}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/setting")}
            style={s.iconBtn}
          >
            <Ionicons name="settings-outline" size={25} color={C.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={{
          paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Header compact */}
        <View style={s.headerWrap}>
          <TouchableOpacity
            onPress={() => setOpenDetails(true)}
            activeOpacity={0.9}
          >
            <View>
              <Avatar />
              <View style={s.addBadge}>
                <Ionicons name="brush" size={12} color={C.primaryForeground} />
              </View>
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{user.fullName}</Text>
            <Text style={s.handle}>{user.email}</Text>
          </View>

          <PillButton
            label="Hồ sơ"
            icon="person-outline"
            colors={C}
            variant="ghost"
            onPress={() => router.push("/profile-detail")}
          />
        </View>

        <View style={s.kpiCard}>
          {kpis.map((kpi, index) => (
            <React.Fragment key={kpi.label}>
              <KPI
                icon={kpi.icon}
                label={kpi.label}
                value={kpi.value}
                C={C}
                iconColor={kpi.iconColor}
                iconBg={kpi.iconBg}
              />
              {index < kpis.length - 1 && <View style={s.kpiDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Tabs */}
        <View style={s.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[s.tab, activeTab === tab.key && s.activeTab]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={
                  activeTab === tab.key
                    ? C.primaryForeground
                    : C.mutedForeground
                }
              />
              <Text
                style={[s.tabText, activeTab === tab.key && s.activeTabText]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={s.tabContent}>
          {activeTab === "contests" && (
            <View style={s.tabScrollContent}>
              {ongoingContests.length > 0 ? (
                <View style={s.contestsList}>
                  {ongoingContests.map((contest) => (
                    <View key={contest.id} style={s.contestCard}>
                      <View style={s.contestHeader}>
                        <Text style={s.contestTitle}>{contest.title}</Text>
                        <View style={s.contestProgress}>
                          <Text style={s.contestProgressText}>
                            {contest.progress}%
                          </Text>
                        </View>
                      </View>
                      <View style={s.contestMeta}>
                        <View style={s.metaChip}>
                          <Ionicons
                            name="calendar-outline"
                            size={14}
                            color={C.mutedForeground}
                          />
                          <Text style={s.metaTxt}>
                            Hạn: {formatDateDisplay(contest.deadline)}
                          </Text>
                        </View>
                        <View style={s.metaChip}>
                          <Ionicons
                            name="trophy-outline"
                            size={14}
                            color={C.mutedForeground}
                          />
                          <Text style={s.metaTxt}>
                            Vòng {contest.currentRound}/{contest.totalRounds}
                          </Text>
                        </View>
                      </View>
                      <View style={s.contestActions}>
                        <TouchableOpacity
                          style={[
                            s.contestActionBtn,
                            contest.submitted && s.submittedBtn,
                          ]}
                          onPress={() => {
                            if (!contest.submitted) {
                              router.push("/painting-upload");
                            }
                          }}
                        >
                          <Ionicons
                            name={
                              contest.submitted
                                ? "checkmark-circle"
                                : "add-circle"
                            }
                            size={16}
                            color={
                              contest.submitted
                                ? C.primaryForeground
                                : C.primary
                            }
                          />
                          <Text
                            style={[
                              s.contestActionText,
                              contest.submitted && s.submittedText,
                            ]}
                          >
                            {contest.submitted ? "Đã nộp" : "Nộp bài"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={s.emptyTab}>
                  <Ionicons name="brush-outline" size={64} color={C.muted} />
                  <Text style={s.emptyTabText}>Chưa tham gia cuộc thi nào</Text>
                  <TouchableOpacity style={s.exploreButton}>
                    <Text style={s.exploreButtonText}>Khám phá cuộc thi</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {activeTab === "achievements" && (
            <View style={s.tabScrollContent}>
              {achievements.length > 0 ? (
                <View style={s.achievementsList}>
                  {achievements.map((achievement) => (
                    <View key={achievement.id} style={s.achievementCard}>
                      <View style={s.achievementIcon}>
                        <Ionicons name="trophy" size={24} color={C.primary} />
                      </View>
                      <View style={s.achievementContent}>
                        <Text style={s.achievementTitle}>
                          {achievement.title}
                        </Text>
                        <Text style={s.achievementPlace}>
                          {achievement.place}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={s.emptyTab}>
                  <Ionicons name="trophy-outline" size={64} color={C.muted} />
                  <Text style={s.emptyTabText}>Chưa có thành tích nào</Text>
                  <TouchableOpacity style={s.exploreButton}>
                    <Text style={s.exploreButtonText}>Tham gia cuộc thi</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {activeTab === "submissions" && (
            <View style={s.tabScrollContent}>
              {submissionsLoading ? (
                <View style={s.emptyTab}>
                  <Ionicons name="sync" size={64} color={C.muted} />
                  <Text style={s.emptyTabText}>Đang tải bài nộp...</Text>
                </View>
              ) : submissions.length > 0 ? (
                <View style={s.submissionsList}>
                  {submissions.map((submission) => (
                    <TouchableOpacity
                      key={submission.paintingId}
                      style={s.submissionCard}
                      onPress={() => {
                        setSelectedSubmission(submission);
                        setOpenSubmission(true);
                      }}
                    >
                      <View style={s.submissionImage}>
                        {submission.imageUrl ? (
                          <Image
                            source={{ uri: submission.imageUrl }}
                            style={s.submissionImageContent}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={[
                              s.submissionImage,
                              {
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 0,
                              },
                            ]}
                          >
                            <Ionicons
                              name="image-outline"
                              size={24}
                              color={C.mutedForeground}
                            />
                          </View>
                        )}
                      </View>
                      <View style={s.submissionContent}>
                        <Text style={s.submissionTitle}>
                          {submission.title}
                        </Text>
                        <Text style={s.submissionContest}>
                          {submission.contest.title}
                        </Text>
                        <View style={s.submissionMeta}>
                          <View style={s.metaChip}>
                            <Ionicons
                              name="calendar-outline"
                              size={12}
                              color={C.mutedForeground}
                            />
                            <Text style={s.metaTxt}>
                              {formatDateDisplay(submission.submissionDate)}
                            </Text>
                          </View>
                          <View
                            style={[
                              s.statusChip,
                              submission.status === "APPROVED" &&
                                s.statusApproved,
                              submission.status === "PENDING" &&
                                s.statusPending,
                              submission.status === "REJECTED" &&
                                s.statusRejected,
                            ]}
                          >
                            <Text style={s.statusText}>
                              {submission.status === "APPROVED"
                                ? "Đã duyệt"
                                : submission.status === "PENDING"
                                ? "Chờ duyệt"
                                : "Từ chối"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={s.emptyTab}>
                  <Ionicons
                    name="document-text-outline"
                    size={64}
                    color={C.muted}
                  />
                  <Text style={s.emptyTabText}>Chưa có bài nộp nào</Text>
                  <TouchableOpacity style={s.exploreButton}>
                    <Text style={s.exploreButtonText}>Nộp bài dự thi</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Modal hồ sơ cá nhân */}
      <ProfileDetailsModal
        visible={openDetails}
        onClose={() => setOpenDetails(false)}
        scheme={scheme}
        user={{
          userId: user.userId,
          fullname: user.fullName,
          email: user.email,
          phone: user.phone || "",
        }}
        achievements={achievements}
      />

      {/* Modal chi tiết bài nộp */}
      {selectedSubmission && (
        <SubmissionDetailsModal
          visible={openSubmission}
          onClose={() => setOpenSubmission(false)}
          submission={selectedSubmission}
          scheme={scheme}
        />
      )}
    </SafeAreaProvider>
  );
}

function KPI({
  icon,
  label,
  value,
  C,
  iconColor = C.foreground,
  iconBg = C.muted,
}: KPIProps) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: iconBg,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 6,
        }}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={{ fontWeight: "800", color: C.foreground }}>{value}</Text>
      <Text style={{ fontSize: 12, color: C.mutedForeground }}>{label}</Text>
    </View>
  );
}

const styles = (C: ColorTokens) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    topbar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 22,
      backgroundColor: C.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    headerTitle: { fontSize: 25, fontWeight: "bold", color: C.foreground },
    iconBtn: { padding: 8, marginLeft: 4 },

    headerWrap: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 10,
      gap: 10,
    },
    name: { fontSize: 15, fontWeight: "800", color: C.foreground },
    handle: { color: C.mutedForeground, marginTop: 2 },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: C.muted,
    },
    addBadge: {
      position: "absolute",
      right: -2,
      bottom: -2,
      backgroundColor: C.primary,
      borderRadius: 12,
      padding: 4,
      borderWidth: 2,
      borderColor: C.background,
    },

    // KPI card
    kpiCard: {
      flexDirection: "row",
      alignItems: "stretch",
      backgroundColor: C.card,
      marginHorizontal: 12,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 8,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    kpiDivider: {
      width: StyleSheet.hairlineWidth,
      backgroundColor: C.border,
      marginVertical: 6,
    },

    // Tab styles
    tabsContainer: {
      flexDirection: "row",
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 16,
      backgroundColor: C.card,
      borderRadius: 12,
      padding: 4,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
      gap: 6,
    },
    activeTab: {
      backgroundColor: C.primary + "15",
    },
    tabText: {
      fontSize: 14,
      fontWeight: "500",
      color: C.mutedForeground,
    },
    activeTabText: {
      color: C.primaryForeground,
      fontWeight: "600",
    },
    tabContent: {
      flex: 1,
      minHeight: 400,
    },
    tabScrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    emptyTab: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyTabText: {
      fontSize: 16,
      color: C.mutedForeground,
      marginTop: 16,
      marginBottom: 24,
      textAlign: "center",
    },
    exploreButton: {
      backgroundColor: C.primary,
      borderRadius: 20,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    exploreButtonText: {
      color: C.primaryForeground,
      fontSize: 14,
      fontWeight: "600",
    },

    // Contest styles
    contestsList: {
      gap: 12,
    },
    contestCard: {
      backgroundColor: C.card,
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    contestHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    contestTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: C.foreground,
      flex: 1,
      marginRight: 12,
    },
    contestProgress: {
      backgroundColor: C.primary + "20",
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    contestProgressText: {
      color: C.primary,
      fontSize: 12,
      fontWeight: "600",
    },
    contestMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    contestActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    contestActionBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.primary + "15",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    submittedBtn: {
      backgroundColor: C.primary,
    },
    contestActionText: {
      marginLeft: 6,
      color: C.primary,
      fontSize: 14,
      fontWeight: "500",
    },
    submittedText: {
      color: C.primaryForeground,
    },

    // Achievement styles
    achievementsList: {
      gap: 12,
    },
    achievementCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.card,
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    achievementIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: C.primary + "15",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    achievementContent: {
      flex: 1,
    },
    achievementTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: C.foreground,
      marginBottom: 4,
    },
    achievementPlace: {
      fontSize: 14,
      color: C.mutedForeground,
    },

    // Submission styles
    submissionsList: {
      gap: 12,
    },
    submissionCard: {
      flexDirection: "row",
      backgroundColor: C.card,
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    submissionImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: C.muted,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    submissionImageContent: {
      width: 60,
      height: 60,
      borderRadius: 8,
    },
    submissionContent: {
      flex: 1,
    },
    submissionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: C.foreground,
      marginBottom: 4,
    },
    submissionContest: {
      fontSize: 14,
      color: C.mutedForeground,
      marginBottom: 8,
    },
    submissionMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statusChip: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusApproved: {
      backgroundColor: "rgba(16,185,129,0.14)",
    },
    statusPending: {
      backgroundColor: "rgba(245,158,11,0.14)",
    },
    statusRejected: {
      backgroundColor: "rgba(239,68,68,0.14)",
    },
    statusText: {
      fontSize: 12,
      fontWeight: "500",
      color: C.mutedForeground,
    },

    metaChip: { flexDirection: "row", alignItems: "center", marginRight: 14 },
    metaTxt: { marginLeft: 4, color: C.mutedForeground, fontSize: 12 },
  });
