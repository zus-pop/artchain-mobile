import PillButton from "@/components/buttons/PillButton";

import ProfileDetailsModal from "@/components/modals/ProfileDetailsModal";
import SegmentedTabsForExaminer, {
  TabItem,
} from "@/components/tabs/SegmentedTabsForExamine";

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
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useWhoAmI } from "@/apis/auth";
import { useExaminerContest } from "@/apis/contest";
import { useAuthStore } from "@/store/auth-store";
import type { Contest, Schedule } from "@/types";
import type { ColorTokens, KPIProps } from "@/types/tabkey";
import { useSchedules } from "../apis/schedule";
import ContestCardForTab from "./cards/ContestCardForTab";
import ScheduleCard from "./cards/ScheduleCard";
import EmptyTab from "./tabs/EmptyTab";

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

/* -------------------- Screen -------------------- */
export default function ExaminerProfileScreen() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];

  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: user, isLoading, refetch: reloadMe } = useWhoAmI();
  const { data: ongoingContests } = useExaminerContest(user?.userId);

  const [openDetails, setOpenDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<"contests" | "schedules">(
    "contests"
  );

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: "clamp",
  });

  useFocusEffect(
    useCallback(() => {
      reloadMe();
    }, [reloadMe])
  );

  // KPIs
  const examinerStats = useMemo(() => {
    const activeContests =
      ongoingContests?.filter((c: Contest) => c.status === "ACTIVE").length ??
      0;
    return { activeContests };
  }, [ongoingContests]);

  const kpis = useMemo(
    () => [
      {
        icon: "trophy-outline" as const,
        label: "Cuộc thi đang chấm",
        value: String(examinerStats.activeContests),
      },
    ],
    [examinerStats]
  );

  // Tabs
  const tabs: TabItem[] = useMemo(
    () => [
      { key: "contests", label: "Cuộc thi", icon: "color-palette-outline" },
      { key: "schedules", label: "Lịch trình", icon: "calendar-outline" },
    ],
    []
  );

  // Schedules demo
  const { data: schedules } = useSchedules(user?.userId);
  /* ---------- Inline components using user/C ---------- */

  function TopBar({
    C,
    title,
    withActions,
  }: {
    C: ColorTokens;
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
              color: C.primaryForeground,
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
              onPress={() => router.push("/painting-evaluationR2")}
              style={t.iconBtn}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={C.primaryForeground}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/setting")}
              style={t.iconBtn}
            >
              <Ionicons
                name="settings-outline"
                size={24}
                color={C.primaryForeground}
              />
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

  function KPI({ icon, label, value, C }: KPIProps) {
    const [g0, g1] = pickGrad(label + value);
    return (
      <View style={{ flex: 1, alignItems: "center" }}>
        <LinearGradient
          colors={[g0, g1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: g1,
            shadowOpacity: 0.25,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <Ionicons name={icon as any} size={18} color={C.primaryForeground} />
        </LinearGradient>
        <Text style={{ fontWeight: "900", color: C.foreground, marginTop: 6 }}>
          {value}
        </Text>
        <Text style={{ fontSize: 12, color: C.mutedForeground }}>{label}</Text>
      </View>
    );
  }

  /* ---------- Loading / Auth states ---------- */

  if (isLoading) {
    return (
      <View style={s.container}>
        <TopBar C={C} title="Hồ sơ" />
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
      <View style={s.container}>
        <TopBar C={C} title="Hồ sơ" />
        <CenteredState
          C={C}
          icon="person-circle-outline"
          title="Bạn chưa đăng nhập"
          message="Đăng nhập để quản lý hồ sơ, theo dõi thành tích và tham gia các cuộc thi."
          action={{
            label: "Đăng nhập / Đăng ký",
            onPress: () => router.push("/login"),
          }}
        />
      </View>
    );
  }

  /* ---------- Main render ---------- */

  return (
    <SafeAreaProvider style={s.container}>
      <TopBar C={C} title="Hồ sơ giám khảo" withActions />

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
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Header compact */}
        <Animated.View
          style={[
            s.headerWrap,
            {
              transform: [{ translateY: headerTranslateY }],
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: C.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setOpenDetails(true)}
            activeOpacity={0.9}
          >
            <View>
              <Avatar />
              {/* Badge cọ vẽ gradient */}
              <View style={[s.addBadge, { borderColor: C.background }]}>
                {(() => {
                  const [b0, b1] = pickGrad("badge");
                  return (
                    <LinearGradient
                      colors={[b0, b1]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ padding: 4, borderRadius: 12 }}
                    >
                      <Ionicons
                        name="brush"
                        size={12}
                        color={C.primaryForeground}
                      />
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
        </Animated.View>

        {/* KPI row (tonal + viền mỏng) */}
        <View
          style={[
            s.kpiCard,
            {
              backgroundColor: C.card,
              shadowColor: "#000",
              borderColor: C.border,
              borderWidth: StyleSheet.hairlineWidth,
            },
          ]}
        >
          {kpis.map((k, i) => (
            <React.Fragment key={k.label}>
              <KPI icon={k.icon as any} label={k.label} value={k.value} C={C} />
              {i < kpis.length - 1 && (
                <View style={[s.kpiDivider, { backgroundColor: C.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Tabs (Segemented) */}
        <SegmentedTabsForExaminer
          tabs={tabs}
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as any)}
          C={C}
          rounded={14}
          height={52}
          softBg
        />

        {/* Tab content */}
        <View style={{ paddingHorizontal: 16 }}>
          {activeTab === "contests" ? (
            ongoingContests && ongoingContests.length > 0 ? (
              <View style={{ gap: 12 }}>
                {ongoingContests.map((contest: Contest) => (
                  <ContestCardForTab
                    key={contest.contestId}
                    C={C}
                    contest={contest as any}
                    onEvaluate={(c) => {
                      if (c.examinerRole === "REVIEW_ROUND_1") {
                        // REVIEW_ROUND_1 examiners go directly to review screen
                        router.push({
                          pathname: "/painting-review-round1",
                          params: {
                            contestId: c.contestId,
                            contestTitle: c.title,
                          },
                        });
                      } else {
                        // Other roles go to paintings list
                        router.push({
                          pathname: "/contest-paintings",
                          params: {
                            contestId: c.contestId,
                            contestTitle: c.title,
                            examinerRole: c.examinerRole,
                          },
                        });
                      }
                    }}
                  />
                ))}
              </View>
            ) : (
              <EmptyTab
                C={C}
                icon="time-outline"
                text="Chưa có cuộc thi nào được giao"
              />
            )
          ) : (
            <>
              {schedules?.data && schedules.data.length > 0 ? (
                // Group schedules by date
                Object.entries(
                  schedules.data.reduce((groups, schedule) => {
                    const dateKey = schedule.date.toString().split("T")[0]; // Use date string, normalize to YYYY-MM-DD format
                    if (!groups[dateKey]) {
                      groups[dateKey] = [];
                    }
                    groups[dateKey].push(schedule);
                    return groups;
                  }, {} as Record<string, Schedule[]>)
                )
                  .sort(
                    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
                  )
                  .map(([dateKey, daySchedules]) => {
                    const [g0, g1] = pickGrad(dateKey);
                    return (
                      <View key={dateKey} style={{ marginBottom: 24 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 12,
                          }}
                        >
                          <LinearGradient
                            colors={[g0, g1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 5,
                              marginRight: 8,
                            }}
                          />
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "800",
                              color: C.foreground,
                            }}
                          >
                            {new Date(dateKey).toLocaleDateString("vi-VN", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: C.mutedForeground,
                              marginLeft: 8,
                            }}
                          >
                            ({daySchedules.length} lịch trình)
                          </Text>
                        </View>

                        <View style={{ gap: 12 }}>
                          {daySchedules
                            .sort(
                              (a, b) =>
                                a.createdAt.getTime() - b.createdAt.getTime()
                            )
                            .map((schedule) => (
                              <ScheduleCard
                                key={schedule.scheduleId}
                                schedule={schedule}
                                C={C}
                              />
                            ))}
                        </View>
                      </View>
                    );
                  })
              ) : (
                <EmptyTab
                  C={C}
                  icon="calendar-outline"
                  text="Chưa có lịch trình nào"
                />
              )}
            </>
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

/* ---------- Shared sub-components ---------- */

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

/* ---------- Styles ---------- */

const s = StyleSheet.create({
  container: { flex: 1 },
  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
    backgroundColor: "transparent",
  },
  name: { fontSize: 16, fontWeight: "900" },
  handle: { marginTop: 2, opacity: 0.8 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  addBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    borderRadius: 12,
    padding: 0, // bọc LinearGradient bên trong
    borderWidth: 2,
  },

  kpiCard: {
    flexDirection: "row",
    alignItems: "stretch",
    marginHorizontal: 12,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    backgroundColor: "transparent",
  },
  kpiDivider: { width: StyleSheet.hairlineWidth, marginVertical: 6 },
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
