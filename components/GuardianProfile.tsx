// screens/GuardianProfileComponent.tsx
import PillButton from "@/components/buttons/PillButton";
import AchievementCard from "@/components/cards/guardian/AchievementCard";
import ChildCard from "@/components/cards/guardian/ChildrentCard";
import ContestCard from "@/components/cards/guardian/ContestCard";
import ProfileDetailsModal from "@/components/modals/ProfileDetailsModal";

// ⚡ dùng GuardianTabs phiên bản mới (slider dưới, không bọc nền)
import GuardianTabs, { GuardianTabKey } from "@/components/tabs/GuardianTabs";

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

// ===== Types / APIs =====
import { useWhoAmI } from "@/apis/auth";
import { useGuardianChildren } from "@/apis/guardian";
import { useAuthStore } from "@/store/auth-store";
import type { ColorTokens, KPIProps } from "@/types/tabkey";
import { formatDateDisplay } from "@/utils/date";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

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

/** Header brand color */
const BRAND = "#dd504b";

export default function GuardianProfileComponent() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: user, isLoading, refetch: reloadMe } = useWhoAmI();
  const C = Colors[scheme];
  const s = styles(C);

  const { data: children } = useGuardianChildren(user?.userId);
  const [openDetails, setOpenDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<GuardianTabKey>("children");

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
  const getChildAvatar = (index: number) =>
    childAvatars[index % childAvatars.length];

  useFocusEffect(
    useCallback(() => {
      reloadMe();
    }, [reloadMe])
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
      <SafeAreaView style={s.container}>
        {/* Solid brand header (loading) */}
        <View
          style={[
            s.topbar,
            { backgroundColor: BRAND, borderBottomColor: C.border },
          ]}
        >
          <Text style={s.headerTitle}>Hồ sơ</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity style={s.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.loaderWrap}>
          <Ionicons name="person-circle-outline" size={80} color={C.muted} />
          <Text style={s.loaderText}>Đang tải hồ sơ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!accessToken || !user) {
    return (
      <SafeAreaView style={s.container}>
        {/* Solid brand header (unauth) */}
        <View
          style={[
            s.topbar,
            { backgroundColor: BRAND, borderBottomColor: C.border },
          ]}
        >
          <Text style={s.headerTitle}>Hồ sơ</Text>
        </View>

        <View style={s.authWrap}>
          <Ionicons name="person-circle-outline" size={80} color={C.muted} />
          <Text style={s.authTitle}>Bạn chưa đăng nhập</Text>
          <Text style={s.authDesc}>
            Đăng nhập để quản lý hồ sơ, theo dõi thành tích và tham gia các cuộc
            thi nghệ thuật hấp dẫn trên ArtChain.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/login")}
            style={s.authBtn}
          >
            <Text style={s.authBtnText}>Đăng nhập / Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      {/* Solid brand header (main) */}
      <View
        style={[
          s.topbar,
          { backgroundColor: BRAND, borderBottomColor: C.border },
        ]}
      >
        <Text style={s.headerTitle}>Hồ sơ phụ huynh</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => router.push("/notifications")}
            style={s.iconBtn}
          >
            <Ionicons name="notifications-outline" size={25} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/setting")}
            style={s.iconBtn}
          >
            <Ionicons name="settings-outline" size={25} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Background blobs (giữ nguyên) */}
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
        contentContainerStyle={{ paddingBottom: 110 }}
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

        {/* KPI */}
        <View style={s.kpiCard}>
          <View style={{ flex: 1 }}>
            <KPI
              icon="people-outline"
              label="Con tham gia"
              value={String(children?.length || 0)}
              C={C}
            />
          </View>
        </View>

  
        <GuardianTabs
          C={C}
          activeTab={activeTab}
          onChange={setActiveTab}
          style={{ marginHorizontal: 12, marginTop: 8, marginBottom: 8 }}
        />

        {/* Tab Content */}
        <View style={s.tabContent}>
          {activeTab === "children" && (
            <View style={s.tabScrollContent}>
              {children && children.length > 0 ? (
                <View style={{ gap: 12 }}>
                  {children.map((child, index) => {
                    const avatar = getChildAvatar(index);
                    return (
                      <ChildCard
                        key={child.userId || child.username || `child-${index}`}
                        C={C}
                        avatarBg={avatar.bg}
                        name={child.fullName}
                        grade={child.grade ?? undefined}
                        schoolName={child.schoolName ?? undefined}
                      />
                    );
                  })}
                </View>
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

              {/* Add child button */}
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
                <View style={{ gap: 12 }}>
                  {ongoingContests.map((contest) => (
                    <ContestCard
                      key={contest.id}
                      C={C}
                      title={contest.title}
                      deadlineText={formatDateDisplay(contest.deadline)}
                      roundText={`Vòng ${contest.currentRound}/${contest.totalRounds}`}
                    />
                  ))}
                </View>
              ) : (
                <View style={s.emptyTab}>
                  <Ionicons name="time-outline" size={64} color={C.muted} />
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
                <View style={{ gap: 12 }}>
                  {achievements.map((a) => (
                    <AchievementCard
                      key={a.id}
                      C={C}
                      title={a.title}
                      place={a.place}
                    />
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
    </SafeAreaView>
  );
}

function KPI({ icon, label, value, C }: KPIProps) {
  const [g0, g1] = pickGrad(label + value);
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <LinearGradient
        colors={[g0, g1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={sKpi.iconGrad}
      >
        <Ionicons name={icon} size={18} color={C.primaryForeground} />
      </LinearGradient>
      <Text style={{ fontWeight: "800", color: C.foreground }}>{value}</Text>
      <Text style={{ fontSize: 12, color: C.mutedForeground }}>{label}</Text>
    </View>
  );
}

const sKpi = StyleSheet.create({
  iconGrad: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
});

const styles = (C: ColorTokens) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },

    /** New solid topbar (replaces topbarGrad) */
    topbar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#fff",
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

    // Tabs container spacing
    tabContent: { flex: 1, minHeight: 400 },
    tabScrollContent: { paddingHorizontal: 16, paddingBottom: 20 },

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
      marginTop: 10,
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

    loaderWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
    },
    loaderText: {
      fontSize: 20,
      fontWeight: "bold",
      color: C.foreground,
      marginTop: 16,
    },

    authWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
    },
    authTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: C.foreground,
      marginTop: 16,
    },
    authDesc: {
      fontSize: 15,
      color: C.mutedForeground,
      marginVertical: 12,
      textAlign: "center",
    },
    authBtn: {
      backgroundColor: C.primary,
      borderRadius: 16,
      paddingHorizontal: 32,
      paddingVertical: 12,
      marginTop: 8,
    },
    authBtnText: {
      color: C.primaryForeground,
      fontWeight: "bold",
      fontSize: 16,
    },
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
