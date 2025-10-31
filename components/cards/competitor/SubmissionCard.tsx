import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type SubmissionItem = {
  paintingId: string;
  title: string;
  contestTitle: string;
  date: string;
  status: "ACCEPTED" | "PENDING" | "REJECTED";
  imageUrl?: string;
};

export default function SubmissionCard({
  item,
  pickGrad,
  borderColor = "#eee",
  mutedFg = "#6b7280",
  onPress,
}: {
  item: SubmissionItem;
  pickGrad: (seed?: string) => [string, string];
  borderColor?: string;
  mutedFg?: string;
  onPress?: (s: SubmissionItem) => void;
}) {
  const [g0, g1] = pickGrad(item.title);

  const statusStyle =
    item.status === "ACCEPTED"
      ? styles.statusApproved
      : item.status === "PENDING"
      ? styles.statusPending
      : styles.statusRejected;

  const statusText =
    item.status === "ACCEPTED"
      ? "Đã duyệt"
      : item.status === "PENDING"
      ? "Chờ duyệt"
      : "Từ chối";

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor }]}
      onPress={() => onPress?.(item)}
      activeOpacity={0.92}
    >
      <View style={styles.thumb}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.thumbImg} />
        ) : (
          <View
            style={[
              styles.thumb,
              {
                alignItems: "center",
                justifyContent: "center",
                marginRight: 0,
              },
            ]}
          >
            <Ionicons name="image-outline" size={22} color={mutedFg} />
          </View>
        )}
        <LinearGradient
          colors={[g0, g1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ribbonLeft}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.contest}>{item.contestTitle}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="calendar-outline" size={12} color={mutedFg} />
            <Text style={[styles.metaTxt, { color: mutedFg }]}>
              {item.date}
            </Text>
          </View>
          <View style={[styles.statusChip, statusStyle]}>
            <Text style={styles.statusTxt}>{statusText}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginRight: 12,
    overflow: "hidden",
  },
  thumbImg: { width: 60, height: 60, borderRadius: 8 },
  ribbonLeft: {
    position: "absolute",
    left: -8,
    top: -8,
    width: 18,
    height: 80,
    transform: [{ rotate: "-18deg" }],
    opacity: 0.35,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  contest: { fontSize: 13, opacity: 0.8, marginBottom: 8 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaChip: { flexDirection: "row", alignItems: "center" },
  metaTxt: { marginLeft: 4, fontSize: 12 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusApproved: { backgroundColor: "rgba(16,185,129,0.14)" },
  statusPending: { backgroundColor: "rgba(245,158,11,0.14)" },
  statusRejected: { backgroundColor: "rgba(239,68,68,0.14)" },
  statusTxt: { fontSize: 12, fontWeight: "600", opacity: 0.9 },
});
