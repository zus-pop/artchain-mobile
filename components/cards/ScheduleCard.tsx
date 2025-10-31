import type { Schedule } from "@/types";
import type { ColorTokens } from "@/types/tabkey";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo } from "react";
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
  schedule: Schedule;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  onPress?: () => void;
};

/* -------------------- Helpers -------------------- */
function formatDateParts(isoDate: string) {
  const [y, m, d] = (isoDate || "").split("-").map(Number);
  const date = new Date(y || 1970, (m || 1) - 1, d || 1);
  const day = String(date.getDate()).padStart(2, "0");
  const monthShort = date
    .toLocaleString("vi-VN", { month: "short" })
    .replace(".", "");
  const weekdayShort = date.toLocaleString("vi-VN", { weekday: "short" });
  return { day, monthShort, weekdayShort };
}

const vividPools: [string, string][] = [
  ["#FF6B6B", "#FFD166"],
  ["#06B6D4", "#3B82F6"],
  ["#22C55E", "#A3E635"],
  ["#F472B6", "#A78BFA"],
  ["#F59E0B", "#F97316"],
  ["#14B8A6", "#84CC16"],
  ["#60A5FA", "#F472B6"],
  ["#F43F5E", "#FB7185"],
];

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function pickGradById(id: string, title: string) {
  const i = hashStr(id + title) % vividPools.length;
  return vividPools[i];
}

function getStatusMeta(status: Schedule["status"], baseGrad: [string, string]) {
  if (status === "ACTIVE")
    return {
      label: "Đang hoạt động",
      icon: "play-circle-outline" as const,
      grad: baseGrad,
    };
  return {
    label: String(status || "Khác"),
    icon: "sparkles-outline" as const,
    grad: baseGrad,
  };
}

/* -------------------- Component -------------------- */
function ScheduleCardRainbow({
  C,
  schedule,
  style,
  titleStyle,
  onPress,
}: Props) {
  const date = new Date(schedule.date); // Convert date string to Date object
  const baseGrad = pickGradById(String(schedule.scheduleId), schedule.task);
  const status = getStatusMeta(schedule.status, baseGrad);
  const timeString = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: C.muted + "55" }}
      style={({ pressed }) => [
        styles.wrapper,
        { shadowColor: "#000" },
        pressed && { transform: [{ scale: 0.996 }] },
        style,
      ]}
    >
      <LinearGradient
        colors={[status.grad[0] + "20", status.grad[1] + "15"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.card}
      >
        <View style={styles.left}>
          <View style={[styles.dateBox, { backgroundColor: status.grad[0] }]}>
            <Text style={[styles.day, { color: "#FFFFFF" }]}>
              {date.getDate()}
            </Text>
            <Text style={[styles.month, { color: "#FFFFFFCC" }]}>
              {date
                .toLocaleString("vi-VN", { month: "short" })
                .replace(".", "")}
            </Text>
          </View>
          {/* <View style={styles.timeBox}>
            <Ionicons name="time-outline" size={14} color={status.grad[0]} />
            <Text style={[styles.time, { color: C.foreground }]}>
              {timeString}
            </Text>
          </View> */}
        </View>

        <View style={styles.right}>
          <Text
            style={[styles.title, { color: C.foreground }, titleStyle]}
            numberOfLines={2}
          >
            {schedule.task}
          </Text>
          <View style={styles.meta}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: status.grad[0] + "25" },
              ]}
            >
              <Ionicons name={status.icon} size={12} color={status.grad[0]} />
              <Text style={[styles.statusText, { color: status.grad[0] }]}>
                {status.label}
              </Text>
            </View>
            <Text style={[styles.contestId, { color: C.mutedForeground }]}>
              Cuộc thi #{schedule.contestId}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default memo(ScheduleCardRainbow);

/* -------------------- Styles -------------------- */
const R = 22;

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: R,
    overflow: Platform.select({ android: "hidden", ios: "visible" }),
  },
  card: {
    borderRadius: R,
    backgroundColor: "transparent",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 120,
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
    width: 6,
  },
  blobTL: {
    position: "absolute",
    top: -20,
    right: -16,
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

  topRow: { flexDirection: "row", alignItems: "stretch" },

  dateBox: {
    width: 70,
    height: 70,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  weekday: { fontSize: 11, fontWeight: "700", opacity: 0.9 },
  day: { fontSize: 28, fontWeight: "900", lineHeight: 32, marginVertical: 2 },
  month: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },

  titleCol: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
    lineHeight: 20,
  },

  statusPill: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
  },
  statusTextWhite: { fontSize: 12, fontWeight: "800", color: "#fff" },

  metaRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },

  /* Chip với viền gradient (fake border) */
  chipWrap: { position: "relative", borderRadius: 999 },
  chipBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
  },
  chip: {
    position: "relative",
    margin: 1.5, // lộ viền gradient
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipText: { fontSize: 13, fontWeight: "700" },

  left: {
    padding: 16,
    paddingRight: 12,
    alignItems: "center",
    minWidth: 90,
  },
  right: {
    flex: 1,
    padding: 16,
    paddingLeft: 12,
    justifyContent: "center",
  },
  timeBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "center",
  },
  time: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },

  meta: {
    marginTop: 12,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  contestId: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.8,
  },
});
