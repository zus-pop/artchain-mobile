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

function statusMeta(status: ExaminerContest["status"], C: ColorTokens) {
  switch (status) {
    case "ACTIVE":
      return {
        label: "Đang diễn ra",
        icon: "play-outline" as const,
        grad: [C.primary, C.chart1],
        fg: C.primaryForeground,
        softBg: C.primary + "22",
      };
    case "UPCOMING":
      return {
        label: "Sắp diễn ra",
        icon: "time-outline" as const,
        grad: [C.chart1, C.primary],
        fg: C.primaryForeground,
        softBg: C.chart1 + "22",
      };
    case "ENDED":
      return {
        label: "Đã kết thúc",
        icon: "stop-circle-outline" as const,
        grad: [C.muted, C.border],
        fg: C.foreground,
        softBg: C.muted + "22",
      };
    case "COMPLETED":
      return {
        label: "Hoàn thành",
        icon: "checkmark-done-outline" as const,
        grad: [C.primary, C.chart1],
        fg: C.primaryForeground,
        softBg: C.primary + "22",
      };
    case "DRAFT":
      return {
        label: "Bản nháp",
        icon: "document-outline" as const,
        grad: [C.muted, C.border],
        fg: C.mutedForeground,
        softBg: C.muted + "22",
      };
    default:
      return {
        label: String(status || "Khác"),
        icon: "sparkles-outline" as const,
        grad: [C.muted, C.border],
        fg: C.foreground,
        softBg: C.muted + "22",
      };
  }
}

function examinerRoleMeta(
  C: ColorTokens,
  role?: ExaminerContest["examinerRole"]
) {
  if (!role) return null;

  switch (role) {
    case "ROUND_1":
      return {
        label: "Chấm Vòng 1",
        icon: "medal-outline" as const,
        grad: [C.primary, C.chart1],
        fg: C.primaryForeground,
        softBg: C.primary + "22",
      };
    case "ROUND_2":
      return {
        label: "Chấm Vòng 2",
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
  const st = statusMeta(contest.status, C);
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
              colors={[st.grad[0], st.grad[1]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pillGrad}
            >
              <Ionicons
                name={st.icon}
                size={14}
                color="#fff"
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

          {/* Role and Actions in same row */}
          <View style={styles.roleAndActionsRow}>
            {/* Examiner Role chip */}
            {examinerMeta && (
              <LinearGradient
                colors={examinerMeta.grad as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.roleChip}
              >
                <Ionicons name={examinerMeta.icon} size={14} color="#ffffff" />
                <Text
                  style={[styles.roleText, { color: "#ffffff" }]}
                  numberOfLines={1}
                >
                  {examinerMeta.label}
                </Text>
              </LinearGradient>
            )}

            {/* Evaluate Button */}
            <Pressable
              onPress={handleEvaluate}
              disabled={isEvaluating || !contest.canEvaluate}
              android_ripple={{ color: "#ffffff22" }}
              style={({ pressed }) => [
                styles.evaluateBtn,
                {
                  backgroundColor: "transparent",
                  opacity:
                    isEvaluating || !contest.canEvaluate
                      ? 0.6
                      : pressed
                      ? 0.96
                      : 1,
                  shadowColor: st.grad[1],
                },
              ]}
            >
              <LinearGradient
                colors={[st.grad[0], st.grad[1]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.evaluateBtnFill}
              >
                <Ionicons
                  name={isEvaluating ? "time" : "star-outline"}
                  size={16}
                  color="#fff"
                />
                <Text style={styles.evaluateBtnText}>
                  {isEvaluating
                    ? "Đang xử lý..."
                    : !contest.canEvaluate
                    ? "Chưa tới lịch chấm"
                    : "Đánh giá"}
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
    borderRadius: 4,
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

  roleAndActionsRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  roleChip: {
    flex: 1,
    borderRadius: 4,

    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    textAlign: "center",
    alignContent: "center",
    justifyContent: "center",
  },
  roleText: { fontSize: 12, fontWeight: "800" },

  evaluateBtn: {
    borderRadius: 4,
    shadowOpacity: 0.12,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
    overflow: "hidden",
  },
  evaluateBtnFill: {
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  evaluateBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.2,
  },

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
