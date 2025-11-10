import PillButton from "@/components/buttons/PillButton";
import AchievementModal from "@/components/modals/AchievementModal";
import ProfileDetailsModal from "@/components/modals/ProfileDetailsModal";
import SubmissionDetailsModal from "../components/modals/SubmissionDetailsModal";

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
import type { ColorTokens, KPIProps } from "@/types/tabkey";
import { formatDateDisplay } from "@/utils/date";
import { useGetAchivementByUserId, useMySubmission } from "../apis/painting";
import { Painting } from "../types";
import AchievementCard, {
  AchievementItem,
} from "./cards/competitor/AchievementCard";
import EmptyState from "./cards/competitor/EmptyState";
import SubmissionCard, {
  SubmissionItem,
} from "./cards/competitor/SubmissionCard";
import SegmentedTabsProfile from "./tabs/SegmentedTabsProfile";

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

  const [openAchModal, setOpenAchModal] = useState(false);
  const [selectedAch, setSelectedAch] = useState<AchievementItem | null>(null);

  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: user, isLoading, refetch: reloadMe } = useWhoAmI();
  const { data: submissions = [], isLoading: submissionsLoading } =
    useMySubmission();
  const { data: achievementData, isLoading: achievementsLoading } =
    useGetAchivementByUserId(user?.userId || "");

  const [openDetails, setOpenDetails] = useState(false);
  const [openSubmission, setOpenSubmission] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Painting | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"achievements" | "submissions">(
    "submissions"
  );

  const achievements = achievementData?.achievements ?? [];

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
    ],
    [submissions.length, achievements.length]
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
    return (
      <View style={[t.topbarGrad, { backgroundColor: C.foreground80 }]}>
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
      </View>
    );
  }

  const Avatar = () => {
    return (
      <View style={{ width: 64, height: 64 }}>
        <View
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 999,
            backgroundColor: C.primary,
          }}
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
    return (
      <View style={{ flex: 1, alignItems: "center" }}>
        <View style={[k.kpiIconGrad, { backgroundColor: C.primary }]}>
          <Ionicons name={icon as any} size={18} color="#fff" />
        </View>
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
    <SafeAreaProvider style={{ backgroundColor: C.newbackground, flex: 1 }}>
      <TopBar title="Hồ sơ thí sinh" withActions />

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
        <View style={[s.headerWrap, { marginBottom: SP.sectionGap }]}>
          <TouchableOpacity
            onPress={() => setOpenDetails(true)}
            activeOpacity={0.9}
            style={{ padding: 8, margin: -8 }} // Expand touch area
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
              {
                key: "submissions",
                label: "Bài nộp",
                icon: "document-text-outline",
              },
              {
                key: "achievements",
                label: "Thành tích",
                icon: "trophy-outline",
              },
            ]}
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k as any)}
            activeFg={C.primary}
            mutedFg={C.mutedForeground}
          />
        </View>

        {/* Tab Content */}
        <View style={s.tabContent}>
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
          {activeTab === "achievements" && (
            <View style={[s.tabScrollContent, { gap: SP.blockGap }]}>
              {achievementsLoading ? (
                <EmptyState
                  C={C}
                  icon="sync"
                  title="Đang tải thành tích..."
                  compact
                />
              ) : achievements.length > 0 ? (
                <View style={{ gap: SP.blockGap, marginBottom: SP.sectionGap }}>
                  {achievements.map((a) => (
                    <TouchableOpacity
                      key={a.paintingId}
                      activeOpacity={0.9}
                      onPress={() => {
                        setSelectedAch(a);
                        setOpenAchModal(true);
                      }}
                    >
                      <AchievementCard
                        item={{
                          id: a.paintingId,
                          title: `${a.award.name} - ${a.contest.title}`,
                          place: a.achievedDate,
                        }}
                        pickGrad={pickGrad}
                        borderColor={C.border}
                      />
                    </TouchableOpacity>
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
      <AchievementModal
        visible={openAchModal}
        onClose={() => setOpenAchModal(false)}
        item={selectedAch}
      />
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
          fontFamily:"Be Vietnam Pro",
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
            fontFamily:"Be Vietnam Pro",
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
              fontFamily:"Be Vietnam Pro",
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
  },
  name: { fontSize: 19, fontWeight: "700", fontFamily: "Be Vietnam Pro" },
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
    borderRadius: 4,
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
