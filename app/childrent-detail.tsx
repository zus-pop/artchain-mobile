// app/childrent-detail.tsx
import { useWhoAmI } from "@/apis/auth";
import { useGuardianChildren } from "@/apis/guardian";
import {
  useGetAchivementByUserId,
  useGetSubmissionsByCompetitorId,
} from "@/apis/painting";
import AppHeader from "@/components/AppHeader";
import AchievementCard, {
  AchievementItem,
} from "@/components/cards/competitor/AchievementCard";
import EmptyState from "@/components/cards/competitor/EmptyState";
import SubmissionCard, {
  SubmissionItem,
} from "@/components/cards/competitor/SubmissionCard";
import AchievementModal from "@/components/modals/AchievementModal";
import SubmissionDetailsModal from "@/components/modals/SubmissionDetailsModal";
import SegmentedTabsProfile from "@/components/tabs/SegmentedTabsProfile";
import { Colors, withOpacity } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Painting } from "@/types";
import { formatDateDisplay } from "@/utils/date";
import { router, useLocalSearchParams } from "expo-router";
import {
  BookUser,
  Cake,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  School,
  User as UserIcon,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ---------- Helpers ---------- */

function fmtDateTime(v?: string | Date | null) {
  if (!v) return undefined;
  try {
    const d = new Date(v);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return undefined;
  }
}

function calcAge(birthday?: string | Date | null) {
  if (!birthday) return undefined;
  const b = new Date(birthday);
  if (isNaN(b.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age >= 0 ? age : undefined;
}
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
const fmtDateOnly = (v?: string | null) => {
  if (!v) return "—";
  // Cắt lấy phần trước ký tự 'T' trong chuỗi ISO
  return v.split("T")[0].split("-").reverse().join("/");
};

const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export default function ChildrentDetailScreen() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const s = styles(C);

  const pickGrad = (seed?: string): [string, string] =>
    VIVID_POOLS[hashStr(seed || Math.random().toString()) % VIVID_POOLS.length];

  const [openAchModal, setOpenAchModal] = useState(false);
  const [selectedAch, setSelectedAch] = useState<AchievementItem | null>(null);

  const { childId } = useLocalSearchParams<{ childId: string }>();

  // Đăng nhập (guardian)
  const { data: me } = useWhoAmI();
  const guardianId = me?.userId;

  // Lấy danh sách children của guardian, để tìm ra child theo childId
  const {
    data: children,
    isLoading,
    error,
    refetch,
  } = useGuardianChildren(guardianId);

  const { data: submissions = [], isLoading: submissionsLoading } =
    useGetSubmissionsByCompetitorId(childId);

  const { data: achievementData, isLoading: achievementsLoading } =
    useGetAchivementByUserId(childId);

  const achievements = achievementData?.achievements ?? [];
  const [openSubmission, setOpenSubmission] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Painting | null>(
    null
  );

  const [activeTab, setActiveTab] = useState<"achievements" | "submissions">(
    "submissions"
  );

  const child = useMemo(
    () => children?.find((c) => c.userId === childId),
    [children, childId]
  );

  const insets = useSafeAreaInsets();
  const SP = {
    pagePB: Math.max(24, insets.bottom + 16),
    sectionGap: 18,
    blockGap: 12,
    kpiCardRadius: 18,
  };

  if (!guardianId) {
    return (
      <View style={[s.screen, s.center]}>
        <Text style={s.muted}>Bạn cần đăng nhập để xem chi tiết con em.</Text>
        <TouchableOpacity
          style={[s.primaryButton, { marginTop: 12 }]}
          onPress={() => router.push("/login")}
          activeOpacity={0.9}
        >
          <Text style={s.primaryButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[s.screen, s.center]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={[s.muted, { marginTop: 10 }]}>Đang tải…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[s.screen, s.center, { padding: 16 }]}>
        <Text style={[s.text, { marginBottom: 10 }]}>
          {(error as any)?.message ?? "Lỗi tải dữ liệu"}
        </Text>
        <TouchableOpacity style={s.primaryButton} onPress={() => refetch()}>
          <Text style={s.primaryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!child) {
    return (
      <View style={[s.screen, s.center]}>
        <Text style={s.muted}>Không tìm thấy thông tin bé</Text>
      </View>
    );
  }

  const age = calcAge(child.birthday);

  return (
    <View style={s.screen}>
      {/* Header kiểu ContestDetail */}
      <AppHeader
        title="Chi tiết con em"
        backgroundColor={C.primary}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* HERO */}
        <View style={s.heroContainer}>
          <View style={s.heroAvatar}>
            <UserIcon size={36} color={"#fff"} />
          </View>
          <View style={s.heroOverlay}>
            <Text style={s.heroTitle}>{child.fullName}</Text>
            <Text style={s.heroSubtitle}>
              {child.username ? `@${child.username}` : "Hồ sơ học sinh"}
            </Text>
          </View>
        </View>

        {/* KEY INFO CARDS */}
        <View style={s.infoCardsContainer}>
          <View style={s.infoCard}>
            <BookUser size={18} color={C.primary} />
            <Text style={s.infoCardValue}>{child.grade ?? "—"}</Text>
            <Text style={s.infoCardLabel}>Khối/Lớp</Text>
          </View>
          <View style={s.infoCard}>
            <CalendarDays size={18} color={C.primary} />
            <Text style={s.infoCardValue}>{age ?? "—"}</Text>
            <Text style={s.infoCardLabel}>Tuổi</Text>
          </View>
        </View>

        {/* HỌC TẬP */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Thông tin học tập</Text>
          </View>
          <View style={s.card}>
            <View style={s.rowItem}>
              <School size={16} color={C.mutedForeground} />
              <Text style={s.rowLabel}>Trường</Text>
              <Text style={s.rowValue}>{child.schoolName || "—"}</Text>
            </View>
            <View style={s.hr} />
            <View style={s.rowItem}>
              <MapPin size={16} color={C.mutedForeground} />
              <Text style={s.rowLabel}>Khu vực</Text>
              <Text style={s.rowValue}>{child.ward || "—"}</Text>
            </View>
            <View style={s.hr} />
            <View style={s.rowItem}>
              <Cake size={16} color={C.mutedForeground} />
              <Text style={s.rowLabel}>Ngày sinh</Text>
              <Text style={s.rowValue}>
                {fmtDateTime(child.birthday) ?? "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* LIÊN HỆ */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Thông tin liên hệ</Text>
          </View>
          <View style={s.card}>
            <View style={s.rowItem}>
              <Mail size={16} color={C.mutedForeground} />
              <Text style={s.rowLabel}>Email</Text>
              <Text style={s.rowValue}>{child.email || "—"}</Text>
            </View>
            <View style={s.hr} />
            <View style={s.rowItem}>
              <Phone size={16} color={C.mutedForeground} />
              <Text style={s.rowLabel}>SĐT</Text>
              <Text style={s.rowValue}>{child.phone || "—"}</Text>
            </View>
          </View>
        </View>

        {/* TABS */}
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

        {/* TAB CONTENT */}
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          {activeTab === "submissions" ? (
            submissionsLoading ? (
              <View
                style={[s.card, { alignItems: "center", paddingVertical: 20 }]}
              >
                <ActivityIndicator color={C.primary} />
                <Text style={[s.muted, { marginTop: 8 }]}>
                  Đang tải bài nộp…
                </Text>
              </View>
            ) : submissions.length ? (
              <View style={{ gap: 10 }}>
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
            )
          ) : achievementsLoading ? (
            <View
              style={[s.card, { alignItems: "center", paddingVertical: 20 }]}
            >
              <ActivityIndicator color={C.primary} />
              <Text style={[s.muted, { marginTop: 8 }]}>
                Đang tải thành tích…
              </Text>
            </View>
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
                      place: fmtDateOnly(a.achievedDate),
                      achievedDate: fmtDateOnly(a.achievedDate),
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
              title="Chưa có Thành Tích"
              action="Nộp bài dự thi"
              compact
            />
          )}
        </View>
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
      </ScrollView>
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = (C: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.newbackground },

    // HERO theo contest-detail
    heroContainer: {
      height: 180,
      position: "relative",
      marginBottom: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    heroAvatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: withOpacity(C.primary, 0.12),
      borderWidth: 1,
      borderColor: withOpacity(C.primary, 0.25),
      alignItems: "center",
      justifyContent: "center",
    },
    heroOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: "center",
    },
    heroTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: C.foreground,
      marginBottom: 4,
    },
    heroSubtitle: { fontSize: 13, color: C.mutedForeground },

    // INFO CARDS
    infoCardsContainer: {
      flexDirection: "row",
      paddingHorizontal: 16,
      marginBottom: 24,
      gap: 12,
    },
    infoCard: {
      flex: 1,
      backgroundColor: C.card,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: C.border,
      gap: 6,
    },
    infoCardValue: { fontSize: 20, fontWeight: "800", color: C.foreground },
    infoCardLabel: {
      fontSize: 11,
      color: C.mutedForeground,
      fontWeight: "500",
    },

    // SECTION
    section: { marginBottom: 24, paddingHorizontal: 16 },
    sectionHeader: { marginBottom: 16 },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: C.foreground,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
      paddingBottom: 6,
      width: "45%",
    },

    // CARD
    card: {
      backgroundColor: C.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.border,
      padding: 12,
    },

    // ROW
    rowItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 10,
    },
    rowLabel: { width: 90, color: C.mutedForeground, fontWeight: "500" },
    rowValue: { flex: 1, color: C.foreground, fontWeight: "600" },
    hr: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: C.border,
      marginVertical: 6,
    },

    // LIST ITEMS (submissions/achievements)
    subItem: {
      backgroundColor: C.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.border,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    subTitle: { color: C.foreground, fontWeight: "700" },
    subMeta: { color: C.mutedForeground, marginTop: 2 },

    // ACTION BUTTONS
    actionsContainer: { paddingHorizontal: 16, marginBottom: 24, gap: 12 },
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
    },
    primaryButton: {
      backgroundColor: C.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: C.primaryForeground,
    },

    text: { color: C.foreground },
    muted: { color: C.mutedForeground },
    center: { justifyContent: "center", alignItems: "center" },
  });
