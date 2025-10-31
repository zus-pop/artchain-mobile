// app/contest-detail.tsx
import { useWhoAmI } from "@/apis/auth";
import { useContestById } from "@/apis/contest";
import AppHeader from "@/components/AppHeader"; // header tùy biến có nút back
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router, useLocalSearchParams } from "expo-router";
import { Trophy } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AnimatedSection, {
  sectionShadow,
} from "../components/header/contest/AnimatedSection";

/** Brand từ ảnh bạn cung cấp */
const BRAND = "#dc5a54";

/** Status tone (nổi bật nhưng tối giản) */
const STATUS = {
  ACTIVE: {
    bg: "#16a34a1a",
    fg: "#166534",
    bd: "#16a34a55",
    label: "Đang diễn ra",
  },
  UPCOMING: {
    bg: "#f59e0b1a",
    fg: "#92400e",
    bd: "#f59e0b55",
    label: "Sắp diễn ra",
  },
  ENDED: {
    bg: "#6b72801a",
    fg: "#374151",
    bd: "#9ca3af55",
    label: "Đã kết thúc",
  },
} as const;

/** Fake rules khi API chưa có dữ liệu */
const DEFAULT_RULES: string[] = [
  "Tác phẩm phải là sáng tác gốc, không vi phạm bản quyền.",
  "Định dạng: JPG/PNG/PDF, tối thiểu 300 DPI, dung lượng ≤ 10MB.",
  "Mỗi thí sinh nộp tối đa 3 tác phẩm.",
  "Không dùng AI tạo nội dung; chỉnh màu cơ bản được chấp nhận.",
  "Ban tổ chức được quyền sử dụng tác phẩm cho mục đích truyền thông.",
  "Kết quả sẽ công bố trong vòng 7 ngày sau khi cuộc thi kết thúc.",
];

export default function ContestDetail() {
  const { contestId } = useLocalSearchParams<{ contestId: string }>();
  const {
    data: contest,
    isLoading,
    error,
    refetch,
  } = useContestById(contestId);
  const { data: me } = useWhoAmI();
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const s = styles(C);

  if (isLoading) {
    return (
      <View style={[s.screen, s.center]}>
        <ActivityIndicator size="large" color={BRAND} />
        <Text style={[s.muted, { marginTop: 10 }]}>Đang tải…</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={[s.screen, s.center, { padding: 16 }]}>
        <Text style={[s.text, { marginBottom: 10 }]}>{error.message}</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => refetch()}>
          <Text style={s.primaryBtnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tone =
    STATUS[(contest?.status ?? "UPCOMING") as keyof typeof STATUS] ??
    STATUS.UPCOMING;
  const rules = DEFAULT_RULES;

  return (
    <View style={s.screen}>
      {/* Header tái sử dụng với màu brand + nút back */}
      <AppHeader
        title="Chi tiết cuộc thi"
        backgroundColor={BRAND}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        {/* HERO CARD (không còn “Quay lại” trên ảnh) */}
        <View style={s.card}>
          <Image
            source={{ uri: contest?.bannerUrl }}
            style={s.cover}
            resizeMode="cover"
          />

          {/* Meta 2 cột cân đối */}
          <View style={s.metaGrid}>
            {/* Box 1: Số giải thưởng + trophy */}
            <View style={s.metaBox}>
              <Text style={s.metaLabel}>Số giải thưởng</Text>
              <View style={s.awardRow}>
                <Trophy
                  size={18}
                  color={scheme === "dark" ? "#e5e7eb" : "#111827"}
                />
                <Text style={s.metaValue}>{contest?.numOfAward ?? 0}</Text>
              </View>
            </View>

            {/* Box 2: Trạng thái */}
            <View style={s.metaBox}>
              <Text style={s.metaLabel}>Trạng thái</Text>
              <View
                style={[
                  s.statusChip,
                  { backgroundColor: tone.bg, borderColor: tone.bd },
                ]}
              >
                <View style={[s.dot, { backgroundColor: tone.fg }]} />
                <Text style={[s.statusText, { color: tone.fg }]}>
                  {tone.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Tiêu đề + mô tả ngắn */}
          <View style={{ padding: 14, paddingTop: 6 }}>
            <Text style={s.title}>{contest?.title}</Text>
            {!!(contest as any)?.subTitle && (
              <Text style={s.subTitle}>{(contest as any)?.subTitle}</Text>
            )}
          </View>
        </View>

        {/* THỜI GIAN CUỘC THI */}
        <View style={s.card}>
          <View style={s.cardHeaderRow}>
            <Text style={s.sectionTitle}>Thời gian cuộc thi</Text>
          </View>
          <View style={{ padding: 14, paddingTop: 8 }}>
            <View style={s.row}>
              <View style={[s.led, { backgroundColor: "#16a34a" }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>Bắt đầu</Text>
                <Text style={s.muted}>
                  {fmtDateTime(contest?.startDate) ?? "—"}
                </Text>
              </View>
            </View>
            <View style={[s.row, { marginTop: 10 }]}>
              <View style={[s.led, { backgroundColor: "#dc2626" }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>Kết thúc</Text>
                <Text style={s.muted}>
                  {fmtDateTime(contest?.endDate) ?? "—"}
                </Text>
              </View>
            </View>
          </View>

          {/* CTA + Rewards */}
          <AnimatedSection delay={360}>
            {["ACTIVE", "ENDED"].includes(contest!.status) && (
              <View style={[s.rewardsBox, sectionShadow.base]}>
                <Text style={s.rewardsTitle}>Award-Winning Paintings</Text>
                <TouchableOpacity
                  style={[s.rewardsBtn, { backgroundColor: C.accent }]}
                  onPress={() => router.push("/reward-painting")}
                  activeOpacity={0.9}
                >
                  <Text style={s.rewardsBtnText}>See Rewards</Text>
                </TouchableOpacity>
              </View>
            )}
          </AnimatedSection>

          {/* Rules */}
          {/* <AnimatedSection delay={420}>
            <View style={[s.block, sectionShadow.base]}>
              <Text style={s.blockTitle}>Rules</Text>
              <Text style={s.rules}>{contest.rules}</Text>
            </View>
          </AnimatedSection> */}
        </View>

        {/* THỂ LỆ (dùng fake data nếu rỗng) */}
        <View style={s.card}>
          <View style={s.cardHeaderRow}>
            <Text style={s.sectionTitle}>Thể lệ cuộc thi</Text>
          </View>
          <View
            style={{ paddingHorizontal: 14, paddingBottom: 14, paddingTop: 6 }}
          >
            {rules.map((r, i) => (
              <View key={i} style={s.ruleRow}>
                <View style={s.star} />
                <Text style={s.text}>{r}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        {contest?.status === "ACTIVE" && (
          <TouchableOpacity
            style={[s.primaryBtn, { alignSelf: "center", marginTop: 8 }]}
            onPress={() => {
              if (!me) {
                router.push("/login");
                return;
              }
              if (me.role === "COMPETITOR") {
                router.push({
                  pathname: "/painting-upload",
                  params: {
                    type: "COMPETITOR",
                    contestId: contest.contestId,
                    competitorId: me.userId,
                    roundId: contest.rounds.find((r) => r.name === "ROUND_1")
                      ?.roundId,
                  },
                });
                return;
              }

              if (me.role === "GUARDIAN") {
                router.push({
                  pathname: "/children-participate",
                  params: {
                    contestId: contest.contestId,
                    roundId: contest.rounds.find((r) => r.name === "ROUND_1")
                      ?.roundId,
                  },
                });
              }
            }}
          >
            <Text style={s.primaryBtnText}>Tham gia</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

/* ---------------- Helpers ---------------- */
function fmtDateTime(v?: string | Date | null) {
  if (!v) return undefined;
  try {
    const d = new Date(v);
    const date = d.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${time} ${date}`;
  } catch {
    return undefined;
  }
}

/* ---------------- Styles ---------------- */
const styles = (C: any) => {
  const R = 8; // ít bo tròn hơn
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.background },

    card: {
      backgroundColor: C.card,
      borderRadius: R,
      borderWidth: 1,
      borderColor: C.border,
      marginBottom: 16,
      overflow: "hidden",
    },

    cover: { width: "100%", height: 200 },

    metaGrid: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 12,
      paddingTop: 12,
    },
    metaBox: {
      flex: 1,
      backgroundColor: C.input,
      borderRadius: R - 2,
      borderWidth: 1,
      borderColor: C.border,
      padding: 12,
    },
    metaLabel: { color: C.mutedForeground, fontWeight: "500", marginBottom: 4 },

    awardRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    metaValue: { color: C.foreground, fontSize: 18, fontWeight: "600" },

    statusChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      alignSelf: "flex-start",
    },
    dot: { width: 8, height: 8, borderRadius: 999 },
    statusText: { fontWeight: "700", fontSize: 12 },

    title: { color: C.foreground, fontSize: 20, fontWeight: "600" },
    subTitle: { marginTop: 4, color: C.mutedForeground },

    cardHeaderRow: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
      backgroundColor: C.card,
    },
    sectionTitle: { color: C.foreground, fontSize: 16, fontWeight: "600" },

    row: { flexDirection: "row", alignItems: "center", gap: 10 },
    led: { width: 10, height: 10, borderRadius: 999 },
    rowTitle: { color: C.foreground, fontWeight: "800", marginBottom: 2 },

    ruleRow: {
      flexDirection: "row",
      gap: 8,
      alignItems: "flex-start",
      marginTop: 10,
    },
    star: {
      width: 6,
      height: 6,
      borderRadius: 999,
      backgroundColor: BRAND,
      marginTop: 7,
    },

    primaryBtn: {
      backgroundColor: BRAND,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: R,
    },
    primaryBtnText: { color: "#fff", fontWeight: "900" },

    ctaBtn: {
      paddingVertical: 14,
      paddingHorizontal: 18,
      borderRadius: R,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      marginBottom: 12,
    },
    ctaText: { color: "#fff", fontWeight: "800", fontSize: 15 },

    rewardsBox: {
      backgroundColor: C.card,
      borderRadius: R,
      padding: 16,
      alignItems: "center",
    },
    rewardsTitle: {
      color: C.foreground,
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 12,
      textAlign: "center",
    },
    rewardsBtn: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: R - 2,
      alignItems: "center",
      justifyContent: "center",
    },
    rewardsBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },

    text: { color: C.foreground },
    muted: { color: C.mutedForeground },
    center: { justifyContent: "center", alignItems: "center" },
  });
};
