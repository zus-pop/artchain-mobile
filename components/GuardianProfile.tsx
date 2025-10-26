import PillButton from "@/components/buttons/PillButton";
import ProfileDetailsModal from "@/components/modals/ProfileDetailsModal";
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
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useGuardianChildren } from "../apis/guardian";

/* -------------------- Color helpers -------------------- */
const VIVID_POOLS: [string, string][] = [
  ["#FF6B6B", "#FFD166"],
  ["#06B6D4", "#3B82F6"],
  ["#22C55E", "#A3E635"],
  ["#F472B6", "#A78BFA"],
  ["#F59E0B", "#F97316"],
  ["#14B8A6", "#84CC16"],
  ["#60A5FA", "#F472B6"],
  ["#F43F5E", "#FB7185"],
];
const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const pickGrad = (seed?: string): [string, string] => {
  const i = hashStr(seed || Math.random().toString()) % VIVID_POOLS.length;
  return VIVID_POOLS[i];
};

export default function GuardianProfileComponent() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: user, isLoading, refetch: reloadMe } = useWhoAmI();
  const C = Colors[scheme];
  const s = styles(C);

  const { data: children } = useGuardianChildren(user?.userId);
  const [openDetails, setOpenDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "children" | "contests" | "achievements"
  >("children");

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
    () => [
      {
        id: "a1",
        title: 'Giải Nhất "Cuộc thi vẽ tranh thiếu nhi toàn quốc 2024"',
        place: "2024 - TP. Hồ Chí Minh",
      },
      {
        id: "a2",
        title: 'Top 10 "Nghệ thuật đường phố TPHCM"',
        place: "2024 - Quận 1",
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

  // Avatar icons and colors for children
  const childAvatars = useMemo(
    () => [
      { icon: "person-outline" as const, bg: "#FF6B6B" },
      { icon: "person-outline" as const, bg: "#4ECDC4" },
      { icon: "person-outline" as const, bg: "#45B7D1" },
      { icon: "person-outline" as const, bg: "#96CEB4" },
      { icon: "person-outline" as const, bg: "#FFEAA7" },
      { icon: "person-outline" as const, bg: "#DDA0DD" },
      { icon: "person-outline" as const, bg: "#98D8C8" },
      { icon: "person-outline" as const, bg: "#F7DC6F" },
      { icon: "person-outline" as const, bg: "#BB8FCE" },
      { icon: "person-outline" as const, bg: "#85C1E9" },
    ],
    []
  );

  const getChildAvatar = (index: number) => {
    return childAvatars[index % childAvatars.length];
  };

  // Guardian KPIs
  const kpis = useMemo(
    () => [
      {
        icon: "people-outline" as const,
        label: "Con tham gia",
        value: String(children?.length || 0),
        iconColor: "#3B82F6",
        iconBg: "rgba(59,130,246,0.14)",
      },
    ],
    [children?.length]
  );

  // Guardian tabs
  const tabs = useMemo(
    () => [
      { key: "children", label: "Con em", icon: "people-outline" },
      { key: "contests", label: "Cuộc thi", icon: "time-outline" },
      { key: "achievements", label: "Thành tích", icon: "trophy-outline" },
    ],
    []
  );

  useFocusEffect(
    useCallback(() => {
      reloadMe();
    }, [])
  );

  const Avatar = () => {
    const seed = user?.email || user?.fullName || "guardian";
    const [g0, g1] = pickGrad(seed);
    return (
      <View style={{ width: 64, height: 64 }}>
        <LinearGradient
          colors={[g0, g1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: "absolute", inset: 0, borderRadius: 32 }}
        />
        <View
          style={{
            position: "absolute",
            inset: 2,
            borderRadius: 32,
            backgroundColor: C.card,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="person-outline" size={22} color={C.mutedForeground} />
        </View>
      </View>
    );
  };
  const scrollY = useRef(new Animated.Value(0)).current;

  if (isLoading) {
    return (
      <View style={s.container}>
        <LinearGradient
          colors={pickGrad("guardian-loading")}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[s.topbarGrad, { borderBottomColor: C.border }]}
        >
          <Text style={s.headerTitle}>Hồ sơ</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity style={s.iconBtn}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={C.primaryForeground}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
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
        <LinearGradient
          colors={pickGrad("guardian-auth")}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[s.topbarGrad, { borderBottomColor: C.border }]}
        >
          <Text style={s.headerTitle}>Hồ sơ</Text>
        </LinearGradient>
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
      {/* Top bar with gradient */}
      <LinearGradient
        colors={pickGrad("guardian-topbar")}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[s.topbarGrad, { borderBottomColor: C.border }]}
      >
        <Text style={s.headerTitle}>Hồ sơ phụ huynh</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => router.push("/notifications")}
            style={s.iconBtn}
          >
            <Ionicons
              name="notifications-outline"
              size={25}
              color={C.primaryForeground}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/setting")}
            style={s.iconBtn}
          >
            <Ionicons
              name="settings-outline"
              size={25}
              color={C.primaryForeground}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Background blobs (mềm, đa sắc) */}
      <LinearGradient
        colors={["#a78bfa22", "#60a5fa16"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={bg.blobTL}
      />
      <LinearGradient
        colors={["#fda4af1f", "#fde68a1f"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={bg.blobBR}
      />

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
              {/* Badge cọ vẽ gradient */}
              <LinearGradient
                colors={pickGrad("brush")}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[s.addBadge, { borderColor: C.background }]}
              >
                <Ionicons name="brush" size={12} color={C.primaryForeground} />
              </LinearGradient>
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
          {kpis.map((kpi) => (
            <View key={kpi.label} style={{ flex: 1 }}>
              <KPI
                icon={kpi.icon}
                label={kpi.label}
                value={kpi.value}
                C={C}
                iconColor={kpi.iconColor}
                iconBg={kpi.iconBg}
              />
            </View>
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
          {activeTab === "children" && (
            <View style={s.tabScrollContent}>
              {children && children.length > 0 ? (
                children.map((child, index) => {
                  const avatar = getChildAvatar(index);
                  return (
                    <View
                      key={child.userId || child.username || `child-${index}`}
                      style={s.childCard}
                    >
                      <View style={s.childHeader}>
                        <View
                          style={[
                            s.childAvatar,
                            { backgroundColor: avatar.bg },
                          ]}
                        >
                          <Ionicons
                            name={avatar.icon}
                            size={24}
                            color="white"
                          />
                        </View>
                        <View style={s.childInfo}>
                          <Text style={s.childName}>
                            {child.fullName || "Tên chưa cập nhật"}
                          </Text>
                          <Text style={s.childDetails}>
                            {child.grade || "Chưa cập nhật"} -{" "}
                            {child.schoolName || "Chưa cập nhật"}
                          </Text>
                        </View>
                      </View>
                      <View style={s.childStats}>
                        <View style={s.childStat}>
                          <Ionicons
                            name="time-outline"
                            size={16}
                            color={C.mutedForeground}
                          />
                          <Text style={s.childStatText}>0 cuộc thi</Text>
                        </View>
                        <View style={s.childStat}>
                          <Ionicons
                            name="trophy-outline"
                            size={16}
                            color={C.mutedForeground}
                          />
                          <Text style={s.childStatText}>0 thành tích</Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={s.emptyTab}>
                  <Ionicons name="people-outline" size={64} color={C.muted} />
                  <Text style={s.emptyTabText}>Chưa có thông tin con em</Text>
                  <Text style={s.emptyTabSubtext}>
                    Thêm thông tin con em để theo dõi thành tích và tham gia
                    cuộc thi
                  </Text>
                </View>
              )}

              {/* Add child button - always visible */}
              <TouchableOpacity
                style={s.addChildButton}
                onPress={() => router.push("/add-child")}
              >
                <Ionicons name="add" size={20} color={C.primaryForeground} />
                <Text style={s.addChildButtonText}>Thêm con em</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === "contests" && (
            <View style={s.tabScrollContent}>
              {ongoingContests.length > 0 ? (
                <View style={s.contestsList}>
                  {ongoingContests.map((contest) => (
                    <View key={contest.id} style={s.contestCard}>
                      <View style={s.contestHeader}>
                        <Text style={s.contestTitle}>{contest.title}</Text>
                        <View style={s.contestParticipants}>
                          <Ionicons
                            name="people-outline"
                            size={14}
                            color={C.mutedForeground}
                          />
                          <Text style={s.contestParticipantsText}>
                            2 con tham gia
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
                    </View>
                  ))}
                </View>
              ) : (
                <View style={s.emptyTab}>
                  <Ionicons name="people-outline" size={64} color={C.muted} />
                  <Text style={s.emptyTabText}>
                    Con em chưa tham gia cuộc thi nào
                  </Text>
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
                  <Text style={s.emptyTabText}>
                    Con em chưa có thành tích nào
                  </Text>
                  <TouchableOpacity style={s.exploreButton}>
                    <Text style={s.exploreButtonText}>
                      Khuyến khích tham gia
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
          userId: user.userId,
          fullname: user.fullName,
          email: user.email,
          phone: user.phone || "",
        }}
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
  const [g0, g1] = pickGrad(label + value);
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <LinearGradient
        colors={[g0, g1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 6,
        }}
      >
        <Ionicons name={icon} size={18} color={C.primaryForeground} />
      </LinearGradient>
      <Text style={{ fontWeight: "800", color: C.foreground }}>{value}</Text>
      <Text style={{ fontSize: 12, color: C.mutedForeground }}>{label}</Text>
    </View>
  );
}

const styles = (C: ColorTokens) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    topbarGrad: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 22,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: "transparent",
    },
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
    headerTitle: {
      fontSize: 25,
      fontWeight: "bold",
      color: C.primaryForeground,
    },
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
      marginBottom: 8,
      textAlign: "center",
    },
    emptyTabSubtext: {
      fontSize: 14,
      color: C.muted,
      marginBottom: 24,
      textAlign: "center",
    },
    addChildButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.primary,
      borderRadius: 20,
      paddingHorizontal: 24,
      paddingVertical: 12,
      gap: 8,
    },
    addChildButtonText: {
      color: C.primaryForeground,
      fontSize: 14,
      fontWeight: "600",
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

    // Guardian styles
    childCard: {
      backgroundColor: C.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    childHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    childAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    childInfo: {
      flex: 1,
    },
    childName: {
      fontSize: 16,
      fontWeight: "600",
      color: C.foreground,
      marginBottom: 4,
    },
    childDetails: {
      fontSize: 14,
      color: C.mutedForeground,
    },
    childStats: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    childStat: {
      flexDirection: "row",
      alignItems: "center",
    },
    childStatText: {
      marginLeft: 6,
      color: C.mutedForeground,
      fontSize: 14,
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
    contestParticipants: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: C.muted + "40",
    },
    contestParticipantsText: {
      marginLeft: 4,
      color: C.mutedForeground,
      fontSize: 12,
      fontWeight: "500",
    },
    contestMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
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

    metaChip: { flexDirection: "row", alignItems: "center", marginRight: 14 },
    metaTxt: { marginLeft: 4, color: C.mutedForeground, fontSize: 12 },
  });

const bg = StyleSheet.create({
  blobTL: {
    position: "absolute",
    top: 80,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 120,
    transform: [{ rotate: "25deg" }],
  },
  blobBR: {
    position: "absolute",
    bottom: 60,
    left: -50,
    width: 240,
    height: 240,
    borderRadius: 140,
    transform: [{ rotate: "-15deg" }],
  },
});
