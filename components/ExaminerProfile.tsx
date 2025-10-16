import PillButton from "@/components/buttons/PillButton";
import ProfileDetailsModal from "@/components/modals/ProfileDetailsModal";
import SubmissionDetailsModal from "@/components/modals/SubmissionDetailsModal";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
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

export default function ExaminerProfileComponent() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: user, isLoading, refetch: reloadMe } = useWhoAmI();
  const C = Colors[scheme];
  const s = styles(C);

  const [openDetails, setOpenDetails] = useState(false);
  const [openSubmission, setOpenSubmission] = useState(false);
  const [activeTab, setActiveTab] = useState<"contests" | "schedules">(
    "contests"
  );

  const ongoingContests = useMemo(
    () => [
      {
        id: "contest1",
        title: "Vẽ Sài Gòn Xanh",
        status: "reviewing",
        deadline: "2024-12-31",
        submissions: 45,
        reviewed: 23,
        totalRounds: 2,
        currentRound: 1,
        category: "Tranh vẽ",
      },
      {
        id: "contest2",
        title: "Nghệ Thuật Đường Phố",
        status: "active",
        deadline: "2025-01-15",
        submissions: 67,
        reviewed: 67,
        totalRounds: 1,
        currentRound: 1,
        category: "Nghệ thuật đường phố",
      },
      {
        id: "contest3",
        title: "Thiết Kế Poster Môi Trường",
        status: "completed",
        deadline: "2024-11-30",
        submissions: 89,
        reviewed: 89,
        totalRounds: 2,
        currentRound: 2,
        category: "Thiết kế đồ họa",
      },
    ],
    []
  );

  // Calculate examiner stats
  const examinerStats = useMemo(() => {
    const activeContests = ongoingContests.filter(
      (c) => c.status === "active" || c.status === "reviewing"
    ).length;
    const totalSubmissions = ongoingContests.reduce(
      (sum, c) => sum + c.submissions,
      0
    );
    const reviewedSubmissions = ongoingContests.reduce(
      (sum, c) => sum + c.reviewed,
      0
    );
    const completionRate =
      totalSubmissions > 0
        ? Math.round((reviewedSubmissions / totalSubmissions) * 100)
        : 0;

    return {
      activeContests,
      totalSubmissions,
      reviewedSubmissions,
      completionRate,
    };
  }, [ongoingContests]);

  const schedules = useMemo(
    () => [
      {
        id: "s1",
        title: "Đánh giá vòng sơ loại - Vẽ Sài Gòn Xanh",
        date: "2024-12-20",
        time: "09:00 - 12:00",
        location: "Trung tâm Văn hóa Quận 1",
        status: "upcoming",
      },
      {
        id: "s2",
        title: "Hội đồng giám khảo - Nghệ thuật đường phố",
        date: "2024-12-22",
        time: "14:00 - 17:00",
        location: "Công viên Tao Đàn",
        status: "upcoming",
      },
      {
        id: "s3",
        title: "Công bố kết quả - Thiết kế poster",
        date: "2024-12-15",
        time: "10:00 - 11:00",
        location: "Online",
        status: "completed",
      },
    ],
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

  // Examiner KPIs
  const kpis = useMemo(
    () => [
      {
        icon: "time-outline" as const,
        label: "Cuộc thi đang chấm",
        value: String(examinerStats.activeContests),
        iconColor: "#8B5CF6",
        iconBg: "rgba(139,92,246,0.14)",
      },
      {
        icon: "document-text-outline" as const,
        label: "Bài nộp đã chấm",
        value: String(examinerStats.reviewedSubmissions),
        iconColor: "#10B981",
        iconBg: "rgba(16,185,129,0.14)",
      },
      {
        icon: "checkmark-circle-outline" as const,
        label: "Tỷ lệ hoàn thành",
        value: `${examinerStats.completionRate}%`,
        iconColor: "#F59E0B",
        iconBg: "rgba(245,158,11,0.14)",
      },
    ],
    [examinerStats, ICONS]
  );

  // Examiner tabs
  const tabs = useMemo(
    () => [
      { key: "contests", label: "Cuộc thi", icon: "time-outline" },
      { key: "schedules", label: "Lịch trình", icon: "calendar-outline" },
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
        <Text style={s.headerTitle}>Hồ sơ giám khảo</Text>
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
                <Ionicons
                  name="person-add-outline"
                  size={12}
                  color={C.primaryForeground}
                />
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
                        <View
                          style={[
                            s.contestStatus,
                            contest.status === "active" && s.statusActive,
                            contest.status === "reviewing" && s.statusReviewing,
                            contest.status === "completed" && s.statusCompleted,
                          ]}
                        >
                          <Text style={s.contestStatusText}>
                            {contest.status === "active"
                              ? "Đang diễn ra"
                              : contest.status === "reviewing"
                              ? "Đang chấm"
                              : "Hoàn thành"}
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
                      <View style={s.contestStats}>
                        <View style={s.statItem}>
                          <Ionicons
                            name="document-text-outline"
                            size={16}
                            color={C.mutedForeground}
                          />
                          <Text style={s.statText}>
                            {contest.submissions} bài nộp
                          </Text>
                        </View>
                        <View style={s.statItem}>
                          <Ionicons
                            name="checkmark-circle-outline"
                            size={16}
                            color={C.mutedForeground}
                          />
                          <Text style={s.statText}>
                            {contest.reviewed} đã chấm
                          </Text>
                        </View>
                      </View>
                      <View style={s.contestActions}>
                        <TouchableOpacity
                          style={s.evaluateButton}
                          onPress={() => {
                            // Navigate to evaluation screen with mock painting data
                            // In a real app, this would fetch paintings from the contest
                            const mockPainting = {
                              paintingId: `painting_${contest.id}_1`,
                              contestId: contest.id,
                              paintingTitle: `Sample Painting from ${contest.title}`,
                              artistName: "Sample Artist",
                              imageUrl:
                                "https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Sample+Painting",
                            };
                            router.push({
                              pathname: "/painting-evaluation",
                              params: mockPainting,
                            });
                          }}
                        >
                          <Ionicons
                            name="star-outline"
                            size={16}
                            color={C.primaryForeground}
                          />
                          <Text style={s.evaluateButtonText}>
                            Evaluate Paintings
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={s.emptyTab}>
                  <Ionicons name="time-outline" size={64} color={C.muted} />
                  <Text style={s.emptyTabText}>
                    Chưa có cuộc thi nào được giao
                  </Text>
                  <TouchableOpacity style={s.exploreButton}>
                    <Text style={s.exploreButtonText}>Xem cuộc thi mới</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {activeTab === "schedules" && (
            <View style={s.tabScrollContent}>
              {schedules.length > 0 ? (
                <View style={s.schedulesList}>
                  {schedules.map((schedule) => (
                    <View key={schedule.id} style={s.scheduleCard}>
                      <View style={s.scheduleHeader}>
                        <View style={s.scheduleTime}>
                          <Ionicons
                            name="time-outline"
                            size={16}
                            color={C.primary}
                          />
                          <Text style={s.scheduleTimeText}>
                            {schedule.time}
                          </Text>
                        </View>
                        <View
                          style={[
                            s.scheduleStatus,
                            schedule.status === "upcoming" && s.statusUpcoming,
                            schedule.status === "completed" &&
                              s.statusCompleted,
                          ]}
                        >
                          <Text style={s.scheduleStatusText}>
                            {schedule.status === "upcoming"
                              ? "Sắp tới"
                              : "Hoàn thành"}
                          </Text>
                        </View>
                      </View>
                      <View style={s.scheduleContent}>
                        <Text style={s.scheduleTitle}>{schedule.title}</Text>
                        <View style={s.scheduleMeta}>
                          <View style={s.metaChip}>
                            <Ionicons
                              name="calendar-outline"
                              size={14}
                              color={C.mutedForeground}
                            />
                            <Text style={s.metaTxt}>
                              {formatDateDisplay(schedule.date)}
                            </Text>
                          </View>
                          <View style={s.metaChip}>
                            <Ionicons
                              name="location-outline"
                              size={14}
                              color={C.mutedForeground}
                            />
                            <Text style={s.metaTxt}>{schedule.location}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={s.emptyTab}>
                  <Ionicons name="calendar-outline" size={64} color={C.muted} />
                  <Text style={s.emptyTabText}>Chưa có lịch trình nào</Text>
                  <TouchableOpacity style={s.exploreButton}>
                    <Text style={s.exploreButtonText}>Xem lịch trình</Text>
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
        achievements={[]}
      />

      {/* Modal chi tiết bài nộp */}
      <SubmissionDetailsModal
        visible={openSubmission}
        onClose={() => setOpenSubmission(false)}
        submission={null}
        scheme={scheme}
      />
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
    contestStatus: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusActive: {
      backgroundColor: "rgba(16,185,129,0.14)",
    },
    statusReviewing: {
      backgroundColor: "rgba(245,158,11,0.14)",
    },
    statusCompleted: {
      backgroundColor: "rgba(59,130,246,0.14)",
    },
    contestStatusText: {
      fontSize: 12,
      fontWeight: "500",
      color: C.mutedForeground,
    },
    contestMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    contestStats: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    statText: {
      marginLeft: 6,
      color: C.mutedForeground,
      fontSize: 14,
    },
    contestCategory: {
      alignSelf: "flex-start",
      backgroundColor: C.muted + "40",
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    categoryText: {
      fontSize: 12,
      color: C.mutedForeground,
      fontWeight: "500",
    },
    contestActions: {
      marginTop: 12,
      alignItems: "flex-start",
    },
    evaluateButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.primary,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 6,
    },
    evaluateButtonText: {
      color: C.primaryForeground,
      fontSize: 14,
      fontWeight: "600",
    },

    // Schedule styles
    schedulesList: {
      gap: 12,
    },
    scheduleCard: {
      backgroundColor: C.card,
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    scheduleHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    scheduleTime: {
      flexDirection: "row",
      alignItems: "center",
    },
    scheduleTimeText: {
      marginLeft: 6,
      color: C.primary,
      fontSize: 14,
      fontWeight: "600",
    },
    scheduleStatus: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusUpcoming: {
      backgroundColor: "rgba(245,158,11,0.14)",
    },
    scheduleStatusText: {
      fontSize: 12,
      fontWeight: "500",
      color: C.mutedForeground,
    },
    scheduleContent: {
      flex: 1,
    },
    scheduleTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: C.foreground,
      marginBottom: 8,
    },
    scheduleMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    metaChip: { flexDirection: "row", alignItems: "center", marginRight: 14 },
    metaTxt: { marginLeft: 4, color: C.mutedForeground, fontSize: 12 },
  });
