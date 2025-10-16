// components/ContestGridCard.tsx
import { LinearGradient } from "expo-linear-gradient";
import { Award, Clock } from "lucide-react-native";
import React, { useMemo, useRef } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Contest } from "../../types";

type Props = { contest: Contest; onPress?: () => void };

export function ContestGridCard({ contest, onPress }: Props) {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const s = styles(C);

  // ===== Press feedback =====
  const pressScale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(pressScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  const onPressOut = () =>
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start();

  // ===== Data =====
  const cover =
    contest.bannerUrl ||
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop";

  const status = String(contest.status ?? "UPCOMING").toUpperCase();

  const statusText = useMemo(() => {
    switch (status) {
      case "ACTIVE":
        return "Đang diễn ra";
      case "UPCOMING":
        return "Sắp diễn ra";
      case "COMPLETED":
        return "Hoàn thành";
      case "ENDED":
        return "Đã kết thúc";
      default:
        return status;
    }
  }, [status]);

  const statusColor = useMemo(() => {
    switch (status) {
      case "ACTIVE":
        return "#10B981"; // emerald
      case "UPCOMING":
        return "#6366F1"; // indigo
      case "COMPLETED":
        return "#16A34A"; // green
      case "ENDED":
        return "#9CA3AF"; // gray
      default:
        return "#9CA3AF";
    }
  }, [status]);

  const periodText = useMemo(() => {
    const start = contest.startDate ? new Date(contest.startDate) : undefined;
    const end = contest.endDate ? new Date(contest.endDate) : undefined;
    const fmt = (d: Date) => d.toLocaleDateString("vi-VN");
    if (start && end) return `${fmt(start)} → ${fmt(end)}`;
    if (end) return `Hạn: ${fmt(end)}`;
    return "—";
  }, [contest.startDate, contest.endDate]);

  return (
    <Animated.View style={{ transform: [{ scale: pressScale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        android_ripple={{ color: C.border }}
        style={s.card}
      >
        {/* Cover: vuông để grid đều & hiện đại */}
        <ImageBackground
          source={{ uri: cover }}
          style={s.cover}
          imageStyle={s.coverImg}
        >
          {/* Tăng độ tương phản vùng chữ & badge */}
          <LinearGradient
            colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.55)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {/* Badge trạng thái (góc trái trên) */}
          <View style={[s.badge, { backgroundColor: statusColor }]}>
            <Text style={s.badgeText} numberOfLines={1}>
              {statusText}
            </Text>
          </View>

          {/* Số giải (góc phải trên) */}
          {!!contest.numOfAward && (
            <View style={s.badgeRight}>
              <Award size={12} color="#fff" />
              <Text style={s.badgeRightText}>{contest.numOfAward}</Text>
            </View>
          )}
        </ImageBackground>

        {/* Info Zone */}
        <View style={s.info}>
          <Text style={s.title} numberOfLines={2}>
            {contest.title || "Cuộc thi"}
          </Text>

          {!!contest.description && (
            <Text style={s.desc} numberOfLines={2}>
              {contest.description}
            </Text>
          )}

          {/* Divider mảnh tăng phân tách */}
          <View style={s.divider} />

          {/* Meta row: thời gian bên trái, giải thưởng bên phải */}
          <View style={s.metaRow}>
            <View style={s.metaLeft}>
              <Clock size={12} color={C.mutedForeground} />
              <Text style={s.metaText} numberOfLines={1}>
                {periodText}
              </Text>
            </View>

            <View style={s.metaRight}>
              <Award size={12} color={C.mutedForeground} />
              <Text style={s.metaText} numberOfLines={1}>
                {contest.numOfAward ?? 0} giải
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default ContestGridCard;

/* ======================== Styles ======================== */
const styles = (C: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: C.card,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth, // viền mảnh kiểu card e-com
      borderColor: C.border,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },

    /* Cover: 1:1 để grid đồng nhất */
    cover: { width: "100%", aspectRatio: 1, justifyContent: "flex-end" },
    coverImg: { resizeMode: "cover" },

    /* Badge trái */
    badge: {
      position: "absolute",
      top: 8,
      left: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
    },
    badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },

    /* Badge phải */
    badgeRight: {
      position: "absolute",
      top: 8,
      right: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: "rgba(17,17,17,0.45)",
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    badgeRightText: { color: "#fff", fontSize: 10, fontWeight: "800" },

    /* Info zone */
    info: { padding: 10, gap: 6, backgroundColor: C.card },
    title: {
      fontSize: 13,
      fontWeight: "800",
      color: C.foreground,
      lineHeight: 18,
      letterSpacing: 0.2,
    },
    desc: {
      fontSize: 11,
      color: C.mutedForeground,
      lineHeight: 15,
    },

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: C.border,
      opacity: 0.6,
      marginTop: 2,
      marginBottom: 2,
    },

    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    metaLeft: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
    metaRight: { flexDirection: "row", alignItems: "center", gap: 6 },
    metaText: {
      fontSize: 11,
      color: C.mutedForeground,
      flexShrink: 1,
    },
  });
