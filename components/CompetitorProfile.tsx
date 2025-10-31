// screens/CompetitorProfileComponent.tsx  (UPDATED FULL - Spacing tuned)
import PillButton from "@/components/buttons/PillButton";
import ProfileDetailsModal from "@/components/modals/ProfileDetailsModal";
import SubmissionDetailsModal from "./modals/SubmissionDetailsModal";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useWhoAmI } from "@/apis/auth";
import { useAuthStore } from "@/store/auth-store";
import type { AchievementItem, ColorTokens, KPIProps } from "@/types/tabkey";
import { formatDateDisplay } from "@/utils/date";
import { useMySubmission } from "../apis/painting";
import { Painting } from "../types";
import AchievementCard from "./cards/competitor/AchievementCard";
import ContestCardCompetitor, {
  ContestItem,
} from "./cards/competitor/ContestCardCompetitor";
import EmptyState from "./cards/competitor/EmptyState";
import SubmissionCard, {
  SubmissionItem,
} from "./cards/competitor/SubmissionCard";
import SegmentedTabsProfile from "./tabs/SegmentedTabsProfile";
import { TabItem } from "./tabs/SegmentedTabsScrollable";

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
const pickGrad = (seed?: string): [string, string] =>
  VIVID_POOLS[hashStr(seed || Math.random().toString()) % VIVID_POOLS.length];

export default function CompetitorProfileComponent() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const insets = useSafeAreaInsets();

  // spacing tokens (dễ chỉnh toàn cục)
  const SP = {
    pagePB: Math.max(24, insets.bottom + 16), // paddingBottom cuối ScrollView
    sectionGap: 18, // khoảng cách giữa các khối lớn
    blockGap: 12, // khoảng cách giữa các card trong 1 section
    kpiCardRadius: 18,
  };

  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: user, isLoading, refetch: reloadMe } = useWhoAmI();
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

  // demo contests
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

  const contestStats = useMemo(() => {
    const activeContests = ongoingContests.length;
    const submittedContests = ongoingContests.filter((c) => c.submitted).length;
    const avgProgress = ongoingContests.length
      ? Math.round(
          ongoingContests.reduce((sum, c) => sum + c.progress, 0) /
            ongoingContests.length
        )
      : 0;
    return { activeContests, submittedContests, avgProgress };
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
          awardId: null,
        },
      ].filter((a) => a.awardId !== null),
    []
  ) as AchievementItem[];

  const kpis = useMemo(
    () => [
      {
        icon: "brush-outline" as const,
        label: "Bài dự thi",
        value: String(submissions.length),
      },
      {
        icon: "trophy-outline" as const,
        label: "Giải thưởng",
        value: String(achievements.length),
      },
      {
        icon: "time-outline" as const,
        label: "Cuộc thi active",
        value: String(contestStats.activeContests),
      },
    ],
    [submissions.length, achievements.length, contestStats]
  );

  const tabs: TabItem[] = useMemo(
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
  const scrollY = useRef(new Animated.Value(0)).current;

  function TopBar({
    title,
    withActions,
  }: {
    title: string;
    withActions?: boolean;
  }) {
    const [g0, g1] = pickGrad(title);
    return (
      <LinearGradient
        colors={[g0, g1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[t.topbarGrad, { borderBottomColor: C.border }]}
      >
        <Text
          style={[
            t.headerTitle,
            {
              color: "#fff",
              textShadowColor: "rgba(0,0,0,0.25)",
              textShadowRadius: 4,
            },
          ]}
        >
          {title}
        </Text>
        {withActions && (
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => router.push("/notifications")}
              style={t.iconBtn}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/setting")}
              style={t.iconBtn}
            >
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    );
  }

  const Avatar = () => {
    const seed = user?.email || user?.fullName || "user";
    const [g0, g1] = pickGrad(seed);
    return (
      <View style={{ width: 64, height: 64 }}>
        <LinearGradient
          colors={[g0, g1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: "absolute", inset: 0, borderRadius: 999 }}
        />
        <View
          style={{
            position: "absolute",
            inset: 2,
            borderRadius: 999,
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

  function KPI({ icon, label, value }: KPIProps) {
    const [g0, g1] = pickGrad(label + value);
    return (
      <View style={{ flex: 1, alignItems: "center" }}>
        <LinearGradient
          colors={[g0, g1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={k.kpiIconGrad}
        >
          <Ionicons name={icon as any} size={18} color="#fff" />
        </LinearGradient>
        <Text style={{ fontWeight: "900", color: C.foreground, marginTop: 6 }}>
          {value}
        </Text>
        <Text style={{ fontSize: 12, color: C.mutedForeground }}>{label}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background }}>
        <TopBar title="Hồ sơ" />
        <CenteredState
          C={C}
          icon="person-circle-outline"
          title="Đang tải hồ sơ..."
        />
      </View>
    );
  }

  if (!accessToken || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background }}>
        <TopBar title="Hồ sơ" />
        <CenteredState
          C={C}
          icon="person-circle-outline"
          title="Bạn chưa đăng nhập"
          message="Đăng nhập để quản lý hồ sơ, theo dõi thành tích và tham gia các cuộc thi nghệ thuật hấp dẫn trên ArtChain."
          action={{
            label: "Đăng nhập / Đăng ký",
            onPress: () => router.push("/login"),
          }}
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider style={s.container}>
      <TopBar title="Hồ sơ thí sinh" withActions />

      {/* background blobs */}
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
        contentContainerStyle={{ paddingBottom: SP.pagePB }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* header compact */}
        <View
          style={[
            s.headerWrap,
            { borderBottomColor: C.border, marginBottom: SP.sectionGap },
          ]}
        >
          <TouchableOpacity
            onPress={() => setOpenDetails(true)}
            activeOpacity={0.9}
          >
            <View>
              <Avatar />
              <View style={[s.addBadge, { borderColor: C.background }]}>
                {(() => {
                  const [b0, b1] = pickGrad("brush-badge");
                  return (
                    <LinearGradient
                      colors={[b0, b1]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ padding: 4, borderRadius: 12 }}
                    >
                      <Ionicons name="brush" size={12} color="#fff" />
                    </LinearGradient>
                  );
                })()}
              </View>
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={[s.name, { color: C.foreground }]}>
              {user.fullName}
            </Text>
            <Text style={[s.handle, { color: C.mutedForeground }]}>
              {user.email}
            </Text>
          </View>

          <PillButton
            label="Hồ sơ"
            icon="person-outline"
            colors={C}
            variant="ghost"
            onPress={() => router.push("/profile-detail")}
          />
        </View>

        {/* KPI row */}
        <View
          style={[
            s.kpiCard,
            {
              backgroundColor: C.card,
              borderColor: C.border,
              borderWidth: StyleSheet.hairlineWidth,
              shadowColor: "#000",
              marginHorizontal: 16,
              marginBottom: SP.sectionGap,
              borderRadius: SP.kpiCardRadius,
            },
          ]}
        >
          {kpis.map((kpi, index) => (
            <React.Fragment key={kpi.label}>
              <KPI icon={kpi.icon} label={kpi.label} value={kpi.value} C={C} />
              {index < kpis.length - 1 && (
                <View style={[s.kpiDivider, { backgroundColor: C.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Tabs (tách component) */}
        <View style={{ marginBottom: SP.sectionGap }}>
          <SegmentedTabsProfile
            tabs={[
              { key: "contests", label: "Cuộc thi", icon: "time-outline" },
              {
                key: "achievements",
                label: "Thành tích",
                icon: "trophy-outline",
              },
              {
                key: "submissions",
                label: "Bài nộp",
                icon: "document-text-outline",
              },
            ]}
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k as any)}
            pickGrad={pickGrad}
            cardBg={C.card}
            mutedFg={C.mutedForeground}
          />
        </View>

        {/* Tab Content */}
        <View style={s.tabContent}>
          {activeTab === "contests" && (
            <View style={[s.tabScrollContent, { gap: SP.blockGap }]}>
              {ongoingContests.length > 0 ? (
                <View style={{ gap: SP.blockGap, marginBottom: SP.sectionGap }}>
                  {ongoingContests.map((c) => (
                    <ContestCardCompetitor
                      key={c.id}
                      item={c as ContestItem}
                      pickGrad={pickGrad}
                      borderColor={C.border}
                      mutedFg={C.mutedForeground}
                      onPressSubmit={() => router.push("/painting-upload")}
                    />
                  ))}
                </View>
              ) : (
                <EmptyState
                  C={C}
                  icon="brush-outline"
                  title="Chưa tham gia cuộc thi nào"
                  action="Khám phá cuộc thi"
                  compact
                />
              )}
            </View>
          )}

          {activeTab === "achievements" && (
            <View style={[s.tabScrollContent, { gap: SP.blockGap }]}>
              {achievements.length > 0 ? (
                <View style={{ gap: SP.blockGap, marginBottom: SP.sectionGap }}>
                  {achievements.map((a) => (
                    <AchievementCard
                      key={a.id}
                      item={{ id: a.id, title: a.title, place: a.place }}
                      pickGrad={pickGrad}
                      borderColor={C.border}
                    />
                  ))}
                </View>
              ) : (
                <EmptyState
                  C={C}
                  icon="trophy-outline"
                  title="Chưa có thành tích nào"
                  action="Tham gia cuộc thi"
                  compact
                />
              )}
            </View>
          )}

          {activeTab === "submissions" && (
            <View style={[s.tabScrollContent, { gap: SP.blockGap }]}>
              {submissionsLoading ? (
                <EmptyState
                  C={C}
                  icon="sync"
                  title="Đang tải bài nộp..."
                  compact
                />
              ) : submissions.length > 0 ? (
                <View style={{ gap: SP.blockGap, marginBottom: SP.sectionGap }}>
                  {submissions.map((sItem) => (
                    <SubmissionCard
                      key={sItem.paintingId}
                      item={
                        {
                          paintingId: sItem.paintingId,
                          title: sItem.title,
                          contestTitle: sItem.contest.title,
                          date: formatDateDisplay(sItem.submissionDate),
                          status: sItem.status,
                          imageUrl: sItem.imageUrl,
                        } as SubmissionItem
                      }
                      pickGrad={pickGrad}
                      borderColor={C.border}
                      mutedFg={C.mutedForeground}
                      onPress={() => {
                        setSelectedSubmission(sItem);
                        setOpenSubmission(true);
                      }}
                    />
                  ))}
                </View>
              ) : (
                <EmptyState
                  C={C}
                  icon="document-text-outline"
                  title="Chưa có bài nộp nào"
                  action="Nộp bài dự thi"
                  compact
                />
              )}
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Modals */}
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

/* -------------------- Small shared states -------------------- */
function CenteredState({
  C,
  icon,
  title,
  message,
  action,
}: {
  C: ColorTokens;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <Ionicons name={icon} size={80} color={C.muted} />
      <Text
        style={{
          fontSize: 20,
          fontWeight: "800",
          color: C.foreground,
          marginTop: 16,
        }}
      >
        {title}
      </Text>
      {!!message && (
        <Text
          style={{
            fontSize: 15,
            color: C.mutedForeground,
            marginVertical: 12,
            textAlign: "center",
          }}
        >
          {message}
        </Text>
      )}
      {!!action && (
        <TouchableOpacity
          onPress={action.onPress}
          style={{
            backgroundColor: C.primary,
            borderRadius: 16,
            paddingHorizontal: 24,
            paddingVertical: 12,
            marginTop: 8,
          }}
        >
          <Text
            style={{
              color: C.primaryForeground,
              fontWeight: "700",
              fontSize: 15,
            }}
          >
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* -------------------- Styles -------------------- */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: "transparent",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  name: { fontSize: 16, fontWeight: "900" },
  handle: { marginTop: 2, opacity: 0.85 },
  addBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    borderRadius: 12,
    padding: 0,
    borderWidth: 2,
  },

  kpiCard: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    backgroundColor: "transparent",
  },
  kpiDivider: { width: StyleSheet.hairlineWidth, marginVertical: 6 },

  tabContent: { flex: 1, minHeight: 400 },
  tabScrollContent: { paddingHorizontal: 16, paddingBottom: 12 },
});

const t = StyleSheet.create({
  topbarGrad: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "transparent",
  },
  headerTitle: { fontSize: 24, fontWeight: "900" },
  iconBtn: { padding: 8, marginLeft: 4 },
});

const k = StyleSheet.create({
  kpiIconGrad: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
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
