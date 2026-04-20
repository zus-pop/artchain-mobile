import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type AchievementItem = {
  paintingId: string;
  paintingTitle: string;
  paintingImage: string;
  award: {
    awardId: number;
    name: string;
    description: string;
    rank: number;
    prize: string;
  };
  contest: {
    contestId: number;
    title: string;
    startDate: string;
    endDate: string;
  };
  achievedDate: string;
};

export default function AchievementCard({
  item,
  pickGrad,
  borderColor = "#eee",
  mutedFg = "#6b7280",
  onPress,
}: {
  item: AchievementItem;
  pickGrad: (seed?: string) => [string, string];
  borderColor?: string;
  mutedFg?: string;
  onPress?: (s: AchievementItem) => void;
}) {
  const [g0, g1] = pickGrad(item.paintingId);

  // Determine medal color based on rank
  const getMedalColor = () => {
    switch (item.award.rank) {
      case 1:
        return { bg: "rgba(217,119,6,0.15)", icon: "#d97706", medal: "🥇" };
      case 2:
        return { bg: "rgba(107,114,128,0.15)", icon: "#6b7280", medal: "🥈" };
      case 3:
        return { bg: "rgba(217,119,6,0.15)", icon: "#b45309", medal: "🥉" };
      default:
        return { bg: "rgba(99,102,241,0.15)", icon: "#6366f1", medal: "⭐" };
    }
  };

  const medalStyle = getMedalColor();

  // Format date to show only DD/MM/YYYY
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <TouchableOpacity
      style={[s.card, { borderColor }]}
      onPress={() => onPress?.(item)}
      activeOpacity={0.92}
    >
      {/* Thumbnail */}
      <View style={s.thumb}>
        {item.paintingImage ? (
          <Image source={{ uri: item.paintingImage }} style={s.thumbImg} />
        ) : (
          <View
            style={[
              s.thumb,
              {
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.06)",
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
          style={s.ribbonLeft}
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text style={s.title} numberOfLines={1}>
          {item.paintingTitle}
        </Text>
        <Text style={s.awardName} numberOfLines={1}>
          {item.award.name}
        </Text>
        <Text style={s.contestTitle} numberOfLines={1}>
          {item.contest.title}
        </Text>
        <View style={s.metaRow}>
          <Ionicons name="calendar-outline" size={12} color={mutedFg} />
          <Text style={[s.metaTxt, { color: mutedFg }]}>
            {formatDate(item.achievedDate)}
          </Text>
        </View>
      </View>

      {/* Ranking Badge - Right Corner */}
      <View
        style={[
          s.rankBadge,
          {
            backgroundColor: medalStyle.bg,
          },
        ]}
      >
        <Text style={s.medal}>{medalStyle.medal}</Text>
        <Text
          style={[
            s.rankText,
            {
              color: medalStyle.icon,
            },
          ]}
        >
          {item.award.rank === 1
            ? "Top 1"
            : item.award.rank === 2
              ? "Top 2"
              : item.award.rank === 3
                ? "Top 3"
                : `Top ${item.award.rank}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
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
    alignItems: "center",
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginRight: 12,
    overflow: "hidden",
    flexShrink: 0,
  },
  thumbImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
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
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  awardName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#d97706",
    marginBottom: 2,
  },
  contestTitle: {
    fontSize: 12,
    opacity: 0.75,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaTxt: {
    fontSize: 11,
    fontWeight: "500",
  },

  // Ranking Badge
  rankBadge: {
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    minWidth: 60,
  },
  medal: {
    fontSize: 18,
    marginBottom: 2,
  },
  rankText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
