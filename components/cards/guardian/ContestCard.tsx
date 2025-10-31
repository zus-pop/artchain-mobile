// components/cards/guardian/ContestCard.tsx
import type { ColorTokens } from "@/types/tabkey";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Status = "active" | "upcoming" | "ended";

type Props = {
  C: ColorTokens;
  title: string;
  deadlineText: string; // "31/12/2025"
  roundText: string;
  participantsText?: string;
  progressPercent?: number;
  status?: Status;
  onPress?: () => void;
  actionText?: string;

  deadlineDaysLeft?: number;

  // === ROUND CUSTOM ===
  roundCurrent?: number;
  roundTotal?: number;
  roundStageText?: string;
  roundAccent?: [string, string];
};

const PAIRS: [string, string][] = [
  ["#06B6D4", "#3B82F6"],
  ["#F97316", "#F59E0B"],
  ["#A78BFA", "#EC4899"],
  ["#22C55E", "#84CC16"],
];

const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const pickGrad = (seed: string): [string, string] =>
  PAIRS[hashStr(seed) % PAIRS.length];

export default function ContestCard({
  C,
  title,
  deadlineText,
  roundText,
  participantsText = "2 con tham gia",
  progressPercent,
  status = "active",
  onPress,
  actionText = "Xem chi tiết",
  deadlineDaysLeft,

  roundCurrent,
  roundTotal,
  roundStageText,
  roundAccent,
}: Props) {
  const [g0, g1] = useMemo(
    () => pickGrad(`${title}-${roundText}`),
    [title, roundText]
  );
  const [r0, r1] = roundAccent ?? [g1, g0];

  const prog =
    typeof progressPercent === "number"
      ? Math.max(0, Math.min(100, Math.round(progressPercent)))
      : undefined;

  const statusCfg: Record<
    Status,
    { icon: string; text: string; bg: string; fg: string }
  > = {
    active: {
      icon: "flash-outline",
      text: "Đang diễn ra",
      bg: "#16a34a26",
      fg: "#16a34a",
    },
    upcoming: {
      icon: "alarm-outline",
      text: "Sắp diễn ra",
      bg: "#2563eb26",
      fg: "#2563eb",
    },
    ended: {
      icon: "checkmark-done-outline",
      text: "Đã kết thúc",
      bg: "#64748b26",
      fg: "#64748b",
    },
  };

  return (
    <LinearGradient
      colors={[g0 + "55", g1 + "55"] as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={s.borderWrap}
    >
      <Pressable
        onPress={onPress}
        android_ripple={{ color: C.muted + "33" }}
        style={({ pressed }) => [
          s.card,
          {
            backgroundColor: C.card,
            shadowColor: g1,
            transform: [{ scale: pressed ? 0.995 : 1 }],
          },
        ]}
      >
        <LinearGradient
          colors={[g0 + "80", g1 + "80"] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.neonTop}
        />
        <LinearGradient
          colors={[g0 + "AA", g1 + "AA"] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.ribbon}
        >
          <Ionicons name="color-wand-outline" size={12} color="#fff" />
        </LinearGradient>

        {/* Header */}
        <View style={s.header}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[s.title, { color: C.foreground }]} numberOfLines={2}>
              {title}
            </Text>

            <View style={s.headerRowChips}>
              {/* Status */}
              <View
                style={[
                  s.statusChip,
                  {
                    backgroundColor: statusCfg[status].bg,
                    borderColor: C.border,
                  },
                ]}
              >
                <Ionicons
                  name={statusCfg[status].icon as any}
                  size={12}
                  color={statusCfg[status].fg}
                />
                <Text
                  style={[s.statusText, { color: statusCfg[status].fg }]}
                  numberOfLines={1}
                >
                  {statusCfg[status].text}
                </Text>
              </View>

              {/* Participants */}
              <View
                style={[
                  s.participants,
                  { backgroundColor: C.muted + "20", borderColor: g0 + "66" },
                ]}
              >
                <LinearGradient
                  colors={[g0, g1] as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.partIconGrad}
                >
                  <View style={s.partIconCore}>
                    <Ionicons name="people-outline" size={12} color="#fff" />
                  </View>
                </LinearGradient>
                <Text
                  style={[s.participantsText, { color: C.mutedForeground }]}
                  numberOfLines={1}
                >
                  {participantsText}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Deadline */}
        <DeadlineBar
          C={C}
          g0={g0}
          g1={g1}
          deadlineText={deadlineText}
          daysLeft={deadlineDaysLeft}
          ended={status === "ended"}
        />

        {/* Round */}
        <RoundPanel
          C={C}
          grad={[r0, r1]}
          roundText={roundText}
          roundCurrent={roundCurrent}
          roundTotal={roundTotal}
          stageText={roundStageText}
        />

        {/* Progress */}
        {typeof prog === "number" ? (
          <View style={s.progressWrap}>
            <View
              style={[s.progressTrack, { backgroundColor: C.muted + "26" }]}
            />
            <LinearGradient
              colors={[g0, g1] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[s.progressBar, { width: `${prog}%`, shadowColor: g1 }]}
            />
            <View style={s.progressRow}>
              <View
                style={[
                  s.progressDot,
                  { backgroundColor: g1 + "CC", borderColor: "#ffffff55" },
                ]}
              />
              <Text style={[s.progressTxt, { color: C.mutedForeground }]}>
                {prog}% hoàn thành
              </Text>
            </View>
          </View>
        ) : null}

        {/* CTA */}
        {onPress ? (
          <View style={s.ctaRow}>
            <Text style={[s.ctaText, { color: C.primary }]}>{actionText}</Text>
            <Ionicons name="arrow-forward" size={16} color={C.primary} />
          </View>
        ) : null}
      </Pressable>
    </LinearGradient>
  );
}

/* ===== DeadlineBar ===== */
function DeadlineBar({
  C,
  g0,
  g1,
  deadlineText,
  daysLeft,
  ended,
}: {
  C: ColorTokens;
  g0: string;
  g1: string;
  deadlineText: string;
  daysLeft?: number;
  ended?: boolean;
}) {
  const pillText =
    typeof daysLeft === "number"
      ? daysLeft > 0
        ? `Còn ${daysLeft} ngày`
        : daysLeft === 0
        ? "Hôm nay hết hạn"
        : "Đã quá hạn"
      : "Hạn nộp";

  return (
    <View style={s.deadlineWrap}>
      <View style={s.deadlineLeft}>
        <View
          style={[
            s.deadlineIconBox,
            { backgroundColor: C.muted + "22", borderColor: C.border },
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color={ended ? "#ef4444" : "#0ea5e9"}
          />
        </View>
        <Text
          style={[s.deadlineText, { color: C.foreground }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {deadlineText}
        </Text>
      </View>

      <LinearGradient
        colors={[g0, g1] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.deadlinePill}
      >
        <Text style={s.deadlinePillText} numberOfLines={1}>
          {pillText}
        </Text>
      </LinearGradient>
    </View>
  );
}

/* ===== RoundPanel ===== */
function RoundPanel({
  C,
  grad,
  roundText,
  roundCurrent,
  roundTotal,
  stageText,
}: {
  C: ColorTokens;
  grad: [string, string];
  roundText: string;
  roundCurrent?: number;
  roundTotal?: number;
  stageText?: string;
}) {
  const mainText =
    typeof roundCurrent === "number" && typeof roundTotal === "number"
      ? `Vòng ${roundCurrent}/${roundTotal}`
      : roundText;

  return (
    <View
      style={[
        s.roundPanel,
        { borderColor: C.border, backgroundColor: C.muted + "10" },
      ]}
    >
      <LinearGradient
        colors={grad as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.roundIconGrad}
      >
        <View style={s.roundIconCore}>
          <Ionicons name="trophy-outline" size={16} color="#fff" />
        </View>
      </LinearGradient>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={[s.roundTitle, { color: C.foreground }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {mainText}
        </Text>
        {stageText ? (
          <Text
            style={[s.roundSub, { color: C.mutedForeground }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {stageText}
          </Text>
        ) : null}
      </View>

      {typeof roundCurrent === "number" && typeof roundTotal === "number" ? (
        <View style={s.roundSteps}>
          {Array.from({ length: Math.max(1, roundTotal) }).map((_, i) => {
            const idx = i + 1;
            const active = idx <= Math.max(1, roundCurrent);
            return (
              <View
                key={idx}
                style={[
                  s.roundDot,
                  active
                    ? { backgroundColor: grad[1], borderColor: "#ffffff55" }
                    : {
                        backgroundColor: "#00000014",
                        borderColor: "#00000014",
                      },
                ]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

/* ===== Styles ===== */
const s = StyleSheet.create({
  borderWrap: { borderRadius: 18, padding: 1.2, marginBottom: 12 },

  card: {
    borderRadius: 16,
    padding: 14,
    overflow: "hidden",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  neonTop: {
    position: "absolute",
    top: 0,
    left: -16,
    right: -16,
    height: 6,
    opacity: 0.85,
  },
  ribbon: {
    position: "absolute",
    top: 10,
    right: -34,
    width: 100,
    height: 18,
    transform: [{ rotate: "35deg" }],
    alignItems: "center",
    justifyContent: "center",
  },

  header: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  title: { fontSize: 16, fontWeight: "900", letterSpacing: 0.2 },
  headerRowChips: { flexDirection: "row", gap: 8, marginTop: 8 },

  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 160,
  },
  statusText: { fontSize: 12.5, fontWeight: "700" },

  participants: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 180,
  },
  partIconGrad: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  partIconCore: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff22",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ffffff55",
  },
  participantsText: { fontSize: 12.5, fontWeight: "700" },

  /* Deadline */
  deadlineWrap: {
    marginTop: 12,
    marginBottom: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#00000010",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  deadlineLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  deadlineIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  deadlineText: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
    flex: 1,
    minWidth: 0,
  },
  deadlinePill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    minWidth: 96,
    alignItems: "center",
    justifyContent: "center",
  },
  deadlinePillText: {
    color: "#fff",
    fontSize: 12.5,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  /* Round */
  roundPanel: {
    marginTop: 6,
    marginBottom: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  roundIconGrad: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  roundIconCore: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff22",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ffffff55",
  },
  roundTitle: { fontSize: 15, fontWeight: "900", letterSpacing: 0.2 },
  roundSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  roundSteps: { flexDirection: "row", gap: 6, paddingLeft: 6 },
  roundDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },

  /* Progress */
  progressWrap: { marginTop: 6 },
  progressTrack: { height: 8, borderRadius: 999, overflow: "hidden" },
  progressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
  },
  progressRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: "#000",
  },
  progressTxt: { fontSize: 12.5, fontWeight: "700", letterSpacing: 0.2 },

  /* CTA */
  ctaRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  ctaText: { fontSize: 13, fontWeight: "800" },
});
