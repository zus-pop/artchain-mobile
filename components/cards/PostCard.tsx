// components/cards/PostCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type Submission = {
  id: string;
  title: string;
  contest: string;
  submissionDate: string;
  status: "winner" | "accepted" | "pending" | "rejected" | string;
  image: string;
  views: number;
  likes: number;
};

type Props = {
  item: Submission;
  C: any; // Colors[scheme]
  onPress?: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
};

const ICON_COLORS = {
  views: "#3B82F6", // blue-500
  likes: "#EF4444", // red-500
};

export default function PostCard({
  item,
  C,
  onPress,
  getStatusColor,
  getStatusText,
}: Props) {
  const statusColor = getStatusColor(item.status);
  const statusText = getStatusText(item.status);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: C.card,
          // Shadow mềm (iOS) + elevation nhẹ (Android)
          shadowColor: C.shadow ?? "#000",
        },
      ]}
    >
      {/* Halo mờ quanh card (thay cho border) */}
      <View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            // dùng màu nền/viền pha mờ để tạo “viền ảo”
            backgroundColor: (C.border ?? "#000") + "0D", // ~opacity 0.05
          },
        ]}
      />

      {/* Thumbnail + status */}
      <View style={[styles.thumbWrap, { backgroundColor: C.muted }]}>
        <Image source={{ uri: item.image }} style={styles.thumb} />
        <View
          style={[
            styles.statusPill,
            { backgroundColor: statusColor + "E6" /* đậm hơn một chút */ },
          ]}
        >
          <Text style={styles.statusTxt} numberOfLines={1}>
            {statusText}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: C.foreground }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={C.mutedForeground}
          />
        </View>

        {/* Contest + date */}
        <Text style={[styles.contest, { color: C.primary }]} numberOfLines={1}>
          {item.contest}
        </Text>
        <Text style={[styles.meta, { color: C.mutedForeground }]}>
          Gửi ngày: {new Date(item.submissionDate).toLocaleDateString("vi-VN")}
        </Text>

        {/* Divider hairline (bên trong, không phải border card) */}
        <View style={[styles.divider, { backgroundColor: C.border }]} />

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: "rgba(59,130,246,0.12)" },
              ]}
            >
              <Ionicons
                name="eye-outline"
                size={14}
                color={ICON_COLORS.views}
              />
            </View>
            <Text style={[styles.statTxt, { color: C.mutedForeground }]}>
              {item.views}
            </Text>
          </View>

          <View style={styles.statChip}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: "rgba(239,68,68,0.12)" },
              ]}
            >
              <Ionicons
                name="heart-outline"
                size={14}
                color={ICON_COLORS.likes}
              />
            </View>
            <Text style={[styles.statTxt, { color: C.mutedForeground }]}>
              {item.likes}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    flexDirection: "row",
    gap: 12,
    borderRadius: 16,
    marginBottom: 14,
    padding: 12,

    // Shadow iOS
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    // Android
    elevation: 2,
  },

  // “Halo” mờ tạo cảm giác viền nhưng không dùng border
  halo: {
    position: "absolute",
    inset: -1, // phủ sát mép ngoài
    borderRadius: 18,
  },

  // Thumbnail
  thumbWrap: {
    width: 100,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  statusPill: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusTxt: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  // Content
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    marginRight: 8,
  },
  contest: {
    fontSize: 13,
    fontWeight: "700",
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
    borderRadius: 1,
    opacity: 0.8,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  statTxt: {
    fontSize: 12,
    fontWeight: "600",
  },
});
