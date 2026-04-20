import { ExaminerContest } from "@/types/contest";
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

type Props = {
  C: ColorTokens;
  contest: ExaminerContest;
  onEvaluate?: (contest: ExaminerContest) => Promise<void> | void;
  onPress?: (contest: ExaminerContest) => void;
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

function getStatusStyle(status: ExaminerContest["status"], C: ColorTokens) {
  switch (status) {
    case "ACTIVE":
      return {
        grad: ["#16a34a", "#22c55e"],
        fg: "#16a34a",
        label: "Đang diễn ra",
      };
    case "UPCOMING":
      return {
        grad: ["#f59e0b", "#fbbf24"],
        fg: "#f59e0b",
        label: "Sắp diễn ra",
      };
    case "ENDED":
      return {
        grad: ["#64748b", "#94a3b8"],
        fg: "#64748b",
        label: "Đã kết thúc",
      };
    case "COMPLETED":
      return {
        grad: ["#16a34a", "#22c55e"],
        fg: "#16a34a",
        label: "Hoàn thành",
      };
    case "DRAFT":
      return {
        grad: ["#64748b", "#94a3b8"],
        fg: "#64748b",
        label: "Bản nháp",
      };
    default:
      return {
        grad: [C.muted, C.border],
        fg: C.foreground,
        label: String(status || "Khác"),
      };
  }
}

function examinerRoleMeta(
  C: ColorTokens,
  role?: ExaminerContest["examinerRole"],
) {
  if (!role) return null;

  switch (role) {
    case "ROUND_1":
      return {
        label: "Chấm Vòng Sơ Khảo",
        icon: "medal-outline" as const,
        grad: [C.primary, C.chart1],
        fg: C.primaryForeground,
        softBg: C.primary + "22",
      };
    case "ROUND_2":
      return {
        label: "Chấm Vòng Chung Khảo",
        icon: "trophy-outline" as const,
        grad: [C.destructive, C.primary],
        fg: C.primaryForeground,
        softBg: C.destructive + "22",
      };
    default:
      return {
        label: String(role),
        icon: "help-circle-outline" as const,
        grad: [C.muted, C.border],
        fg: C.foreground,
        softBg: C.muted + "22",
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
  const st = getStatusStyle(contest.status, C);
  const examinerMeta = examinerRoleMeta(C, contest.examinerRole);

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

  // Determine button state and label
  const isButtonDisabled =
    isEvaluating || !contest.canEvaluate || contest.status === "ENDED";
  const getButtonLabel = () => {
    if (isEvaluating) return "Đang xử lý...";
    if (contest.status === "ENDED") return "Cuộc thi đã kết thúc";
    if (!contest.canEvaluate) return "Chưa tới lịch chấm";
    return examinerMeta?.label || "Chấm bài";
  };

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
              colors={st.grad as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pillGrad}
            >
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

          {/* Role Action Button - Replaces both role chip and evaluate button */}
          {examinerMeta && (
            <Pressable
              onPress={handleEvaluate}
              disabled={isButtonDisabled}
              android_ripple={{ color: "#ffffff22" }}
              style={({ pressed }) => [
                styles.roleActionBtn,
                {
                  opacity: isButtonDisabled ? 0.5 : pressed ? 0.92 : 1,
                },
              ]}
            >
              <LinearGradient
                colors={examinerMeta.grad as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.roleActionBtnFill}
              >
                <Ionicons
                  name={isEvaluating ? "time" : examinerMeta.icon}
                  size={16}
                  color="#ffffff"
                />
                <Text style={styles.roleActionText} numberOfLines={1}>
                  {getButtonLabel()}
                </Text>
              </LinearGradient>
            </Pressable>
          )}
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
    shadowRadius: 4,
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
    borderRadius: 2,
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
    fontSize: 12,
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

  roleActionBtn: {
    marginTop: 16,
    borderRadius: 4,
    shadowOpacity: 0.12,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
    overflow: "hidden",
  },
  roleActionBtnFill: {
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  roleActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.2,
  },

  actions: { marginTop: 16 },
});
