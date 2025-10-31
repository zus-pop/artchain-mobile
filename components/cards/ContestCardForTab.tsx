import type { ColorTokens } from "@/types/tabkey";
import { formatDateDisplay } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

type Contest = {
  contestId: string;
  title: string;
  startDate: string | Date;
  endDate: string | Date;
  status: "ACTIVE" | "COMPLETED" | string;
  category?: string;
  examinerRole?: "ROUND_1" | "REVIEW_ROUND_1" | "ROUND_2";
};

type Props = {
  C: ColorTokens;
  contest: Contest;
  onEvaluate?: (contest: Contest) => Promise<void> | void;
  onPress?: (contest: Contest) => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
};

/* -------------------- Helpers -------------------- */
function calcProgress(start: string | Date, end: string | Date) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const now = Date.now();
  if (Number.isNaN(s) || Number.isNaN(e) || e <= s)
    return { pct: 0, daysLeft: undefined };
  const t = Math.min(Math.max(now, s), e);
  const pct = Math.round(((t - s) / (e - s)) * 100);
  const daysLeft = now < e ? Math.ceil((e - now) / (24 * 60 * 60 * 1000)) : 0;
  return { pct, daysLeft };
}

function statusMeta(status: Contest["status"]) {
  if (status === "ACTIVE")
    return {
      label: "Đang diễn ra",
      icon: "play-outline" as const,
      grad: ["#34d399", "#22d3ee"],
      fg: "#065f46",
      softBg: "rgba(52,211,153,0.12)",
    };
  if (status === "COMPLETED")
    return {
      label: "Hoàn thành",
      icon: "checkmark-done-outline" as const,
      grad: ["#60a5fa", "#a78bfa"],
      fg: "#1e3a8a",
      softBg: "rgba(96,165,250,0.14)",
    };
  return {
    label: String(status || "Khác"),
    icon: "sparkles-outline" as const,
    grad: ["#f472b6", "#f59e0b"],
    fg: "#7c2d12",
    softBg: "rgba(245,158,11,0.14)",
  };
}

const pastelPool = [
  ["#FFE1E1", "#FFD1F7"],
  ["#E1F6FF", "#E1FFE7"],
  ["#FFF3D6", "#FFE7C2"],
  ["#EDE7FF", "#D7F0FF"],
  ["#FFE0F1", "#FFEAD1"],
];

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function categoryColors(category?: string) {
  if (!category)
    return {
      bg: "rgba(148,163,184,0.18)",
      fg: "#334155",
      icon: "color-palette-outline" as const,
    };
  const idx = hashStr(category) % pastelPool.length;
  const pair = pastelPool[idx];
  return {
    bg: pair[0],
    fg: "#334155",
    icon: "color-palette-outline" as const,
    grad: pair as [string, string],
  };
}

function examinerRoleMeta(role?: Contest["examinerRole"]) {
  if (!role) return null;

  switch (role) {
    case "ROUND_1":
      return {
        label: "Vai trò: Chấm vòng 1",
        icon: "medal-outline" as const,
        grad: ["#fbbf24", "#f59e0b"],
        fg: "#92400e",
        softBg: "rgba(245,158,11,0.14)",
      };
    case "REVIEW_ROUND_1":
      return {
        label: "Vai trò: Chấm lại vòng 1",
        icon: "eye-outline" as const,
        grad: ["#8b5cf6", "#a855f7"],
        fg: "#581c87",
        softBg: "rgba(139,92,246,0.14)",
      };
    case "ROUND_2":
      return {
        label: "Vai trò: Chấm vòng 2",
        icon: "trophy-outline" as const,
        grad: ["#ef4444", "#dc2626"],
        fg: "#7f1d1d",
        softBg: "rgba(239,68,68,0.14)",
      };
    default:
      return {
        label: "Vai trò: " + String(role),
        icon: "help-circle-outline" as const,
        grad: ["#6b7280", "#4b5563"],
        fg: "#374151",
        softBg: "rgba(107,114,128,0.14)",
      };
  }
}

/* -------------------- Component -------------------- */
function ContestCardColorful({
  C,
  contest,
  onEvaluate,
  onPress,
  style,
  titleStyle,
}: Props) {
  const st = statusMeta(contest.status);
  const { pct, daysLeft } = calcProgress(contest.startDate, contest.endDate);
  const isActive = contest.status === "ACTIVE";
  const cat = categoryColors(contest.category);
  const examinerMeta = examinerRoleMeta(contest.examinerRole);

  // Anti-spam: khoá nút trong lúc xử lý
  const [isEvaluating, setIsEvaluating] = useState(false);
  const handleEvaluate = useCallback(async () => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    try {
      await onEvaluate?.(contest);
    } finally {
      // nới tay một nhịp để chặn double tap/gõ liên tục
      setTimeout(() => setIsEvaluating(false), 800);
    }
  }, [isEvaluating, onEvaluate, contest]);

  return (
    <Pressable
      onPress={() => onPress?.(contest)}
      android_ripple={{ color: C.muted + "55" }}
      style={({ pressed }) => [
        styles.wrapper,
        { shadowColor: "#000" },
        pressed && { transform: [{ scale: 0.997 }] },
        style,
      ]}
    >
      {/* Layer 1: gradient nền kính */}
      <LinearGradient
        colors={[C.card, C.card]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.card}
      >
        {/* lớp kính mờ */}
        <View
          style={[
            styles.glass,
            { backgroundColor: C.muted + "20", borderColor: C.muted + "30" },
          ]}
        />

        {/* blob trang trí */}
        <LinearGradient
          colors={[st.grad[0] + "66", st.grad[1] + "33"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.blobTL}
        />
        <LinearGradient
          colors={["#fca5a5" + "40", "#fde68a" + "40"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.blobBR}
        />

        {/* Thanh nhấn cạnh trái nhiều màu */}
        <LinearGradient
          colors={[st.grad[0], st.grad[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.accent}
        />

        {/* Nội dung */}
        <View style={{ padding: 16 }}>
          {/* Header: Title + Status pill (gradient) */}
          <View style={styles.headerRow}>
            <Text
              style={[styles.title, { color: C.foreground }, titleStyle]}
              numberOfLines={2}
            >
              {contest.title}
            </Text>

            <LinearGradient
              colors={[st.grad[0], st.grad[1]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pillGrad}
            >
              <Ionicons
                name={st.icon}
                size={14}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.pillTextWhite}>{st.label}</Text>
            </LinearGradient>
          </View>

          {/* Date range */}
          <View style={styles.rowBetween}>
            <View style={styles.metaChip}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={C.mutedForeground}
              />
              <Text style={[styles.metaText, { color: C.mutedForeground }]}>
                Bắt đầu: {formatDateDisplay(contest.startDate)}
              </Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={C.mutedForeground}
              />
              <Text style={[styles.metaText, { color: C.mutedForeground }]}>
                Kết thúc: {formatDateDisplay(contest.endDate)}
              </Text>
            </View>
          </View>

          {/* Progress (gradient nhiều màu) */}
          {isActive && (
            <View style={{ marginTop: 12 }}>
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: C.muted + "55" },
                ]}
              >
                <LinearGradient
                  colors={[
                    "#34d399",
                    "#22d3ee",
                    "#60a5fa",
                    "#a78bfa",
                    "#f472b6",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBar, { width: `${pct}%` }]}
                />
              </View>
              <View style={styles.progressMeta}>
                <Text
                  style={[styles.progressText, { color: C.mutedForeground }]}
                >
                  Tiến độ: {pct}%
                </Text>
                <Text
                  style={[styles.progressText, { color: C.mutedForeground }]}
                >
                  {daysLeft! > 0 ? `Còn ${daysLeft} ngày` : "Đến hạn"}
                </Text>
              </View>
            </View>
          )}

          {/* Category chip (pastel dynamic) */}
          {!!contest.category && (
            <View style={[styles.categoryRow]}>
              <LinearGradient
                colors={cat.grad ?? [cat.bg, cat.bg]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.categoryChip}
              >
                <Ionicons name={cat.icon} size={14} color={cat.fg} />
                <Text
                  style={[styles.categoryText, { color: cat.fg }]}
                  numberOfLines={1}
                >
                  {contest.category}
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Examiner Role chip */}
          {examinerMeta && (
            <View style={[styles.categoryRow]}>
              <LinearGradient
                colors={examinerMeta.grad as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.categoryChip}
              >
                <Ionicons name={examinerMeta.icon} size={14} color="#ffffff" />
                <Text
                  style={[styles.categoryText, { color: "#ffffff" }]}
                  numberOfLines={1}
                >
                  {examinerMeta.label}
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              onPress={handleEvaluate}
              disabled={isEvaluating}
              android_ripple={{ color: "#ffffff22" }}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: "transparent",
                  opacity: isEvaluating ? 0.6 : pressed ? 0.96 : 1,
                  shadowColor: st.grad[1],
                },
              ]}
            >
              <LinearGradient
                colors={[st.grad[0], st.grad[1]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtnFill}
              >
                <Ionicons
                  name={isEvaluating ? "time" : "star-outline"}
                  size={16}
                  color="#fff"
                />
                <Text style={styles.primaryBtnText}>
                  {isEvaluating ? "Đang xử lý..." : "Đánh giá tác phẩm"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default memo(ContestCardColorful);

/* -------------------- Styles -------------------- */
const R = 22;

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: R,
    shadowOpacity: 0.09,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    overflow: Platform.select({ android: "hidden", ios: "visible" }),
  },
  card: {
    borderRadius: R,
    overflow: "hidden",
  },
  glass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: R,
    borderWidth: StyleSheet.hairlineWidth,
  },
  accent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  blobTL: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.6,
    transform: [{ rotate: "25deg" }],
  },
  blobBR: {
    position: "absolute",
    bottom: -24,
    left: -18,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.45,
    transform: [{ rotate: "-15deg" }],
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  pillGrad: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
  },
  pillTextWhite: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
    paddingVertical: 2,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "600",
  },

  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBar: {
    height: 10,
    borderRadius: 999,
  },
  progressMeta: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressText: { fontSize: 12, fontWeight: "700" },

  categoryRow: { marginTop: 12 },
  categoryChip: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryText: { fontSize: 12, fontWeight: "800" },

  actions: { marginTop: 16 },
  primaryBtn: {
    alignSelf: "flex-start",
    borderRadius: 999,
    shadowOpacity: 0.12,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
    overflow: "hidden",
  },
  primaryBtnFill: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.2,
  },
});
