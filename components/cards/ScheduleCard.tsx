// components/cards/ScheduleCardRainbow.tsx
import type { Schedule } from "@/types";
import type { ColorTokens } from "@/types/tabkey";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useMemo, useRef } from "react";
import {
  Animated,
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
  if (status === "UPCOMING")
    return {
      label: "Sắp diễn ra",
      icon: "alarm-outline" as const,
      grad: baseGrad,
    };
  if (status === "ENDED")
    return {
      label: "Đã kết thúc",
      icon: "checkmark-done-circle-outline" as const,
      grad: baseGrad,
    };
  return {
    label: String(status || "Khác"),
    icon: "sparkles-outline" as const,
    grad: baseGrad,
  };
}

function getRoundLabel(round2Table: any | null): string {
  return round2Table ? "Vòng 2" : "Vòng 1";
}

function getRoundIcon(round2Table: any | null): string {
  return round2Table ? "trophy-outline" : "medal-outline";
}

/* -------------------- Component -------------------- */
function ScheduleCardRainbow({
  C,
  schedule,
  style,
  titleStyle,
  onPress,
}: Props) {
  const date = useMemo(() => new Date(schedule.date), [schedule.date]);
  const baseGrad = useMemo(
    () => pickGradById(String(schedule.scheduleId ?? ""), schedule.task ?? ""),
    [schedule.scheduleId, schedule.task],
  );
  const status = useMemo(
    () => getStatusMeta(schedule.status, baseGrad),
    [schedule.status, baseGrad],
  );
  const timeString = useMemo(
    () =>
      date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [date],
  );

  // Press scale animation (use ONE spring param group)
  const scale = useRef(new Animated.Value(1)).current;
  const animateTo = (v: number) => {
    scale.stopAnimation();
    Animated.spring(scale, {
      toValue: v,
      stiffness: 260,
      damping: 24,
      mass: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.985)}
        onPressOut={() => animateTo(1)}
        android_ripple={{ color: C.muted + "33", borderless: false }}
        accessibilityRole="button"
        style={[
          styles.wrapper,
          {
            backgroundColor: C.card,
            borderColor: C.border,
            shadowColor: "#000",
          },
          style,
        ]}
      >
        {/* Accent gradient strip */}
        <LinearGradient
          colors={status.grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.accent}
        />

        {/* Glass inner border */}
        <View
          pointerEvents="none"
          style={[
            styles.glass,
            { borderColor: C.border + "66", backgroundColor: C.card + "00" },
          ]}
        />

        {/* Decorative blobs */}
        <LinearGradient
          colors={[status.grad[0] + "1A", status.grad[1] + "00"]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.blobTL}
        />
        <LinearGradient
          colors={[status.grad[1] + "26", status.grad[0] + "00"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.blobBR}
        />

        {/* Content */}
        <View style={styles.card}>
          {/* Left – Date + Time */}
          <View style={styles.left}>
            <LinearGradient
              colors={status.grad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dateBox}
            >
              <Text style={[styles.day, { color: "#FFFFFF" }]}>
                {String(date.getDate()).padStart(2, "0")}
              </Text>
              <Text style={[styles.month, { color: "#FFFFFFCC" }]}>
                {date
                  .toLocaleString("vi-VN", { month: "short" })
                  .replace(".", "")}
              </Text>
            </LinearGradient>

            <View style={styles.timeBox}>
              <Ionicons name="time-outline" size={14} color={status.grad[0]} />
              <Text style={[styles.time, { color: C.foreground }]}>
                {timeString}
              </Text>
            </View>
          </View>

          {/* Right – Title + Meta */}
          <View style={styles.right}>
            <Text
              style={[styles.title, { color: C.foreground }, titleStyle]}
              numberOfLines={2}
            >
              {schedule.task}
            </Text>

            <View style={styles.meta}>
              {/* Round badge */}
              <View
                style={[
                  styles.roundBadge,
                  {
                    backgroundColor: schedule.round2Table
                      ? "#FFF3E0"
                      : "#E3F2FD",
                    borderColor: schedule.round2Table ? "#FF9800" : "#2196F3",
                  },
                ]}
              >
                <Ionicons
                  name={getRoundIcon(schedule.round2Table)}
                  size={12}
                  color={schedule.round2Table ? "#FF9800" : "#2196F3"}
                />
                <Text
                  style={[
                    styles.roundText,
                    {
                      color: schedule.round2Table ? "#FF9800" : "#2196F3",
                    },
                  ]}
                >
                  {getRoundLabel(schedule.round2Table)}
                </Text>
              </View>

              {/* Contest id */}
              <View
                style={[
                  styles.idPill,
                  {
                    backgroundColor: C.muted + "26",
                    borderColor: C.border + "66",
                  },
                ]}
              >
                <Ionicons
                  name="trophy-outline"
                  size={12}
                  color={C.mutedForeground}
                />
                <Text style={[styles.contestId, { color: C.mutedForeground }]}>
                  Cuộc thi #{schedule.contestId}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default memo(ScheduleCardRainbow);

/* -------------------- Styles -------------------- */
const R = 12;

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: R,
    overflow: Platform.select({ android: "hidden", ios: "visible" }),
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  card: {
    borderRadius: R,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 118,
    paddingLeft: 12, // space for accent
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
    borderTopLeftRadius: R,
    borderBottomLeftRadius: R,
  },

  blobTL: {
    position: "absolute",
    top: -24,
    right: -18,
    width: 140,
    height: 140,
    borderRadius: 24,
    opacity: 0.7,
    transform: [{ rotate: "25deg" }],
  },
  blobBR: {
    position: "absolute",
    bottom: -28,
    left: -20,
    width: 160,
    height: 160,
    borderRadius: 28,
    opacity: 0.55,
    transform: [{ rotate: "-15deg" }],
  },

  left: {
    padding: 16,
    paddingRight: 12,
    alignItems: "center",
    minWidth: 94,
  },
  dateBox: {
    width: 72,
    height: 72,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  day: {
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 32,
    marginVertical: 2,
  },
  month: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  timeBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "center",
  },
  time: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
    letterSpacing: 0.2,
  },

  right: {
    flex: 1,
    padding: 16,
    paddingLeft: 12,
    justifyContent: "center",
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.2,
    lineHeight: 22,
  },

  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  roundBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  roundText: {
    fontSize: 12,
    fontWeight: "800",
  },

  idPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contestId: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.95,
  },
});
