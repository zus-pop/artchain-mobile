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

type Schedule = {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "09:00 - 12:00"
  location: string;
  status: "upcoming" | "completed" | string;
};

type Props = {
  C: ColorTokens;
  item: Schedule;
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
  if (status === "upcoming")
    return {
      label: "Sắp diễn ra",
      icon: "time-outline" as const,
      grad: baseGrad,
    };
  if (status === "completed")
    return {
      label: "Hoàn thành",
      icon: "checkmark-done-outline" as const,
      grad: baseGrad,
    };
  return {
    label: String(status || "Khác"),
    icon: "sparkles-outline" as const,
    grad: baseGrad,
  };
}

/* -------------------- Component -------------------- */
function ScheduleCardRainbow({ C, item, style, titleStyle, onPress }: Props) {
  const { day, monthShort, weekdayShort } = formatDateParts(item.date);
  const baseGrad = pickGradById(item.id, item.title);
  const status = getStatusMeta(item.status, baseGrad);

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
      {/* Card container với glass effect */}
      <View style={[styles.card]}>
        {/* lớp kính mờ */}
        <View
          style={[
            styles.glass,
            { backgroundColor: C.muted + "22", borderColor: C.muted + "33" },
          ]}
        />

        {/* blobs trang trí */}
        <LinearGradient
          colors={[baseGrad[0] + "55", baseGrad[1] + "33"]}
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

        {/* Thanh nhấn cạnh trái đa sắc */}
        <LinearGradient
          colors={[baseGrad[0], baseGrad[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.accent}
        />

        {/* Nội dung */}
        <View style={{ padding: 16 }}>
          <View style={styles.topRow}>
            {/* Ô ngày pastel */}
            <LinearGradient
              colors={[baseGrad[0] + "2A", baseGrad[1] + "2A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dateBox}
            >
              <Text style={[styles.weekday, { color: C.mutedForeground }]}>
                {weekdayShort}
              </Text>
              <Text style={[styles.day, { color: C.foreground }]}>{day}</Text>
              <Text style={[styles.month, { color: C.mutedForeground }]}>
                {monthShort}
              </Text>
            </LinearGradient>

            {/* Tiêu đề + pill trạng thái gradient */}
            <View style={styles.titleCol}>
              <View style={styles.headerRow}>
                <Text
                  style={[styles.title, { color: C.foreground }, titleStyle]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <LinearGradient
                  colors={[status.grad[0], status.grad[1]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statusPill}
                >
                  <Ionicons
                    name={status.icon}
                    size={14}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.statusTextWhite}>{status.label}</Text>
                </LinearGradient>
              </View>

              {/* Chips: giờ & địa điểm (viền gradient) */}
              <View style={styles.metaRow}>
                <View style={styles.chipWrap}>
                  <LinearGradient
                    colors={[baseGrad[0], baseGrad[1]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.chipBorder}
                  />
                  <View style={[styles.chip, { backgroundColor: C.card }]}>
                    <Ionicons
                      name="time-outline"
                      size={15}
                      color={C.mutedForeground}
                    />
                    <Text
                      style={[styles.chipText, { color: C.mutedForeground }]}
                    >
                      {item.time}
                    </Text>
                  </View>
                </View>

                <View style={styles.chipWrap}>
                  <LinearGradient
                    colors={[baseGrad[1], baseGrad[0]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.chipBorder}
                  />
                  <View style={[styles.chip, { backgroundColor: C.card }]}>
                    <Ionicons
                      name="location-outline"
                      size={15}
                      color={C.mutedForeground}
                    />
                    <Text
                      style={[styles.chipText, { color: C.mutedForeground }]}
                      numberOfLines={1}
                    >
                      {item.location}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(ScheduleCardRainbow);

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
    backgroundColor: "transparent",
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
    width: 74,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
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
  title: { flex: 1, fontSize: 17, fontWeight: "900", letterSpacing: 0.2 },

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
});
