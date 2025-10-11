import PillButton from "@/components/buttons/PillButton";
import ProfileDetailsModal from "@/components/modals/ProfileDetailsModal";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
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

import { useMySubmission } from "@/apis/painting";
import { useAuthStore } from "@/store/auth-store";
import type { ColorTokens, KPIProps, UserStats } from "@/types/tabkey";
import { formatDateDisplay } from "@/utils/date";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: user, isLoading } = useWhoAmI();
  const C = Colors[scheme];
  const s = styles(C);
  const { data: mySubmission = [], isLoading: isMySubmissionLoading } =
    useMySubmission();
  const userStats: UserStats = {
    totalSubmissions: 12,
    wins: 3,
    views: 2450,
    likes: 120,
    rating: 4.7,
  };

  const [openDetails, setOpenDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "contests" | "achievements" | "submissions"
  >("contests");

  const ongoingContests = useMemo(
    () => [
      {
        id: "contest1",
        title: "Vẽ Sài Gòn Xanh",
        progress: 75, // percentage
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
    () => [
      {
        id: "a1",
        title: `Giải Nhất "${mySubmission[0]?.contest.title || "Cuộc thi"}"`,
        place: "2024 - TP. Hồ Chí Minh",
      },
      {
        id: "a2",
        title: `Top 10 "${mySubmission[1]?.contest.title || "Cuộc thi"}"`,
        place: "2024 - Quận 1",
      },
    ],
    [mySubmission]
  );

  const getStatusColor = (status: string) =>
    status === "winner" || status === "approved" || status === "accepted"
      ? C.chart1 || C.primary
      : status === "accepted" || status === "approved"
      ? C.primary
      : status === "rejected" || status === "denied"
      ? C.destructive
      : status === "pending" || status === "reviewing" || status === "submitted"
      ? C.mutedForeground
      : C.mutedForeground;

  const getStatusText = (status: string) => {
    return status === "WINNER" || status === "APPROVED"
      ? "Giải thưởng"
      : status === "ACCEPTED" || status === "APPROVED"
      ? "Được chấp nhận"
      : status === "REJECTED" || status === "DENIED"
      ? "Bị từ chối"
      : status === "PENDING" || status === "REVIEWING"
      ? "Đang xử lý"
      : status === "SUBMITTED"
      ? "Đã nộp"
      : "Không xác định";
  };

  const ICONS: Record<
    "brush" | "trophy" | "eye" | "heart",
    { fg: string; bg: string }
  > = {
    brush: { fg: "#F59E0B", bg: "rgba(245,158,11,0.14)" }, // amber
    trophy: { fg: "#EAB308", bg: "rgba(234,179,8,0.14)" }, // yellow
    eye: { fg: "#3B82F6", bg: "rgba(59,130,246,0.14)" }, // blue
    heart: { fg: "#EF4444", bg: "rgba(239,68,68,0.14)" }, // red
  };
  // Show loading state while fetching user data
  // Trước đây: const Avatar = (): JSX.Element => { ... }  // -> lỗi
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
        <Text style={s.headerTitle}>Hồ sơ</Text>
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

      {/* <StickyProfileHeader
        title={user.fullName}
        colors={C}
        scrollY={scrollY}
        showAt={60} // đẩy thêm nếu muốn hiện muộn hơn
        onBack={() => router.back()}
        showRight={true}
        onRightPress={() => router.push("/setting")}
      /> */}

      <Animated.ScrollView
        contentContainerStyle={{
          paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true } // chỉ animate opacity/transform → OK
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
            {/* {!!user.subtitle && (
              <Text style={s.followers}>{user.subtitle}</Text>
            )}
            {!!user.location && (
              <Text style={[s.followers, { marginTop: 4 }]}>
                {user.location}
              </Text>
            )} */}
          </View>

          <PillButton
            label="Hồ sơ"
            icon="person-outline"
            colors={C}
            variant="ghost"
            onPress={() => router.push("/profile-detail")} // hoặc "/profile-screen" nếu bạn đặt tên vậy
          />
        </View>

        <View style={s.kpiCard}>
          <KPI
            icon="brush-outline"
            label="Tác phẩm"
            value={String(userStats.totalSubmissions)}
            C={C}
            iconColor={ICONS.brush.fg}
            iconBg={ICONS.brush.bg}
          />
          <View style={s.kpiDivider} />
          <KPI
            icon="trophy-outline"
            label="Giải thưởng"
            value={String(userStats.wins)}
            C={C}
            iconColor={ICONS.trophy.fg}
            iconBg={ICONS.trophy.bg}
          />
          <View style={s.kpiDivider} />
          <KPI
            icon="time-outline"
            label="Cuộc thi active"
            value={String(contestStats.activeContests)}
            C={C}
            iconColor="#8B5CF6"
            iconBg="rgba(139,92,246,0.14)"
          />
        </View>

        {/* Tabs */}
        <View style={s.tabsContainer}>
          <TouchableOpacity
            style={[s.tab, activeTab === "contests" && s.activeTab]}
            onPress={() => setActiveTab("contests")}
          >
            <Ionicons
              name="time-outline"
              size={18}
              color={
                activeTab === "contests"
                  ? C.primaryForeground
                  : C.mutedForeground
              }
            />
            <Text
              style={[s.tabText, activeTab === "contests" && s.activeTabText]}
            >
              Cuộc thi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.tab, activeTab === "achievements" && s.activeTab]}
            onPress={() => setActiveTab("achievements")}
          >
            <Ionicons
              name="trophy-outline"
              size={18}
              color={
                activeTab === "achievements"
                  ? C.primaryForeground
                  : C.mutedForeground
              }
            />
            <Text
              style={[
                s.tabText,
                activeTab === "achievements" && s.activeTabText,
              ]}
            >
              Thành tích
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.tab, activeTab === "submissions" && s.activeTab]}
            onPress={() => setActiveTab("submissions")}
          >
            <Ionicons
              name="brush-outline"
              size={18}
              color={
                activeTab === "submissions"
                  ? C.primaryForeground
                  : C.mutedForeground
              }
            />
            <Text
              style={[
                s.tabText,
                activeTab === "submissions" && s.activeTabText,
              ]}
            >
              Bài dự thi
            </Text>
          </TouchableOpacity>
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
                            {
                              backgroundColor: contest.submitted
                                ? C.primary + "20"
                                : C.muted + "40",
                            },
                          ]}
                        >
                          <Ionicons
                            name={
                              contest.submitted
                                ? "checkmark-circle"
                                : "time-outline"
                            }
                            size={14}
                            color={
                              contest.submitted
                                ? C.primaryForeground
                                : C.mutedForeground
                            }
                          />
                          <Text
                            style={[
                              s.contestStatusText,
                              {
                                color: contest.submitted
                                  ? C.primaryForeground
                                  : C.mutedForeground,
                              },
                            ]}
                          >
                            {contest.submitted ? "Đã nộp" : "Chưa nộp"}
                          </Text>
                        </View>
                      </View>

                      <View style={s.contestProgress}>
                        <View style={s.progressBar}>
                          <View
                            style={[
                              s.progressFill,
                              {
                                width: `${contest.progress}%`,
                                backgroundColor: contest.submitted
                                  ? C.primary
                                  : C.muted,
                              },
                            ]}
                          />
                        </View>
                        <Text style={s.progressText}>
                          {contest.progress}% hoàn thành
                        </Text>
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
                    </View>
                  ))}
                </View>
              ) : (
                <View style={s.emptyTab}>
                  <Ionicons name="time-outline" size={64} color={C.muted} />
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
              {isMySubmissionLoading ? (
                <View style={s.emptyTab}>
                  <Ionicons name="brush-outline" size={64} color={C.muted} />
                  <Text style={s.emptyTabText}>Đang tải bài dự thi...</Text>
                </View>
              ) : mySubmission.length > 0 ? (
                <View style={s.submissionsList}>
                  {mySubmission.map((item) => (
                    <TouchableOpacity
                      key={item.paintingId}
                      style={s.submissionCard}
                      onPress={() => {
                        // TODO: điều hướng chi tiết bài gửi
                      }}
                    >
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={s.submissionImage}
                      />
                      <View style={s.submissionContent}>
                        <Text style={s.submissionTitle}>{item.title}</Text>
                        <Text style={s.submissionContest}>
                          {item.contest.title}
                        </Text>
                        <View style={s.submissionMeta}>
                          <View style={s.metaChip}>
                            <Ionicons
                              name="calendar-outline"
                              size={14}
                              color={C.mutedForeground}
                            />
                            <Text style={s.metaTxt}>
                              {formatDateDisplay(item.submissionDate)}
                            </Text>
                          </View>
                          <View
                            style={[
                              s.badge,
                              { backgroundColor: getStatusColor(item.status) },
                            ]}
                          >
                            <Text style={s.badgeTxt}>
                              {getStatusText(item.status)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={s.emptyTab}>
                  <Ionicons name="brush-outline" size={64} color={C.muted} />
                  <Text style={s.emptyTabText}>Chưa có bài dự thi nào</Text>
                  <TouchableOpacity style={s.exploreButton}>
                    <Text style={s.exploreButtonText}>
                      Tạo tác phẩm đầu tiên
                    </Text>
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
          name: user.fullName,
          email: user.email,
          phone: user.phone || "",
          location: `${user.ward}, ${user.schoolName}`,
        }}
        achievements={achievements}
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
    followers: { color: C.mutedForeground, marginTop: 6, fontSize: 12 },
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

    chipsRow: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 16,
      paddingTop: 6,
      paddingBottom: 10,
    },
    chip: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.card,
      borderRadius: 12,
      paddingVertical: 10,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    chipText: { color: C.foreground, fontWeight: "600" },

    // User Info Cards
    infoCards: {
      marginHorizontal: 12,
      marginTop: 8,
      gap: 8,
    },
    infoCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.card,
      borderRadius: 12,
      padding: 12,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    infoLabel: {
      fontSize: 12,
      color: C.mutedForeground,
      fontWeight: "500",
    },
    infoValue: {
      fontSize: 14,
      color: C.foreground,
      fontWeight: "600",
      marginTop: 2,
    },

    // KPI card — bỏ border, thêm shadow + divider hairline
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

    ratingBox: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: C.card,
      marginHorizontal: 12,
      marginTop: 8,
      borderRadius: 12,
      paddingVertical: 14,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    ratingText: { fontWeight: "800", color: C.foreground },
    ratingSub: { color: C.mutedForeground },

    sectionDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: C.border,
      marginHorizontal: 12,
      marginTop: 12,
      marginBottom: 2,
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
      minHeight: 400, // Ensure minimum height for tab content
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

    postRow: {
      flexDirection: "row",
      backgroundColor: C.card,
      borderRadius: 12,
      marginBottom: 12,
      padding: 10,
      shadowColor: "#000",
      shadowOpacity: 0.07,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    postThumb: { width: 92, height: 110, borderRadius: 10, marginRight: 12 },
    postTitle: {
      fontWeight: "800",
      color: C.foreground,
      flex: 1,
      marginRight: 8,
    },
    postContest: { color: C.primary, marginTop: 2, fontWeight: "600" },
    postMeta: { color: C.mutedForeground, fontSize: 12, marginTop: 4 },
    badge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: "flex-start",
    },
    badgeTxt: { color: C.primaryForeground, fontSize: 10, fontWeight: "700" },
    metaChip: { flexDirection: "row", alignItems: "center", marginRight: 14 },
    metaTxt: { marginLeft: 4, color: C.mutedForeground, fontSize: 12 },

    // New section styles
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
    submissionsList: {
      gap: 12,
    },
    submissionCard: {
      flexDirection: "row",
      backgroundColor: C.card,
      borderRadius: 12,
      padding: 12,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    submissionImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
      marginRight: 12,
    },
    submissionContent: {
      flex: 1,
      justifyContent: "space-between",
    },
    submissionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: C.foreground,
      marginBottom: 4,
    },
    submissionContest: {
      fontSize: 14,
      color: C.primary,
      fontWeight: "500",
      marginBottom: 8,
    },
    submissionMeta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    // Contest participation styles
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
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    contestStatusText: {
      fontSize: 12,
      fontWeight: "500",
    },
    contestProgress: {
      marginBottom: 12,
    },
    progressBar: {
      height: 6,
      backgroundColor: C.muted,
      borderRadius: 3,
      overflow: "hidden",
      marginBottom: 6,
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
    },
    progressText: {
      fontSize: 12,
      color: C.mutedForeground,
      textAlign: "right",
    },
    contestMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
  });
