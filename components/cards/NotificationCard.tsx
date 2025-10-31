import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: "contest" | "submission" | "result" | "system";
  isRead: boolean;
  date: string; // ISO
};

function fromNow(dateISO: string) {
  const d = new Date(dateISO).getTime();
  const diff = Date.now() - d;
  const min = Math.floor(diff / (1000 * 60));
  if (min < 1) return "Vừa xong";
  if (min < 60) return `${min} phút trước`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} giờ trước`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day} ngày trước`;
  return new Date(d).toLocaleDateString("vi-VN");
}

const TYPE_GRAD: Record<NotificationItem["type"], [string, string]> = {
  contest: ["#60A5FA", "#7C3AED"],
  submission: ["#34D399", "#10B981"],
  result: ["#F59E0B", "#F97316"],
  system: ["#A78BFA", "#8B5CF6"],
};
const TYPE_ICON: Record<
  NotificationItem["type"],
  keyof typeof Ionicons.glyphMap
> = {
  contest: "trophy-outline",
  submission: "document-text-outline",
  result: "checkmark-done-outline",
  system: "settings-outline",
};
const TYPE_LABEL: Record<NotificationItem["type"], string> = {
  contest: "Cuộc thi",
  submission: "Nộp bài",
  result: "Kết quả",
  system: "Hệ thống",
};

type Props = {
  item: NotificationItem;
  onPress?: () => void;
  onLongPress?: () => void;
};

const NotificationCard: React.FC<Props> = ({ item, onPress, onLongPress }) => {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const grad = useMemo(() => TYPE_GRAD[item.type], [item.type]);
  const isDark = scheme === "dark";

  // pulse ring (only for unread)
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!item.isRead) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [item.isRead, pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0],
  });

  const unreadGlowShadow = item.isRead ? 0 : 0.18;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: C.muted }}
      style={({ pressed }) => [
        styles.wrap,
        {
          backgroundColor: isDark ? "#0B1220" : "#FFFFFF",
          borderColor: item.isRead ? C.border : `${grad[1]}55`,
          opacity: pressed ? 0.96 : 1,
          shadowColor: item.isRead ? (isDark ? "#000" : "#111827") : grad[1],
          shadowOpacity: item.isRead ? 0.06 : unreadGlowShadow,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${TYPE_LABEL[item.type]}: ${item.title}${
        item.isRead ? "" : ", chưa đọc"
      }`}
    >
      {/* accent bar (đậm hơn khi chưa đọc) */}
      <LinearGradient
        colors={
          item.isRead ? [`${grad[0]}26`, `${grad[1]}26`] : [grad[0], grad[1]]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.accent, !item.isRead && { width: 7 }]}
      />

      {/* unread background sheen */}
      {!item.isRead && (
        <LinearGradient
          colors={[`${grad[0]}10`, `${grad[1]}14`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* left column: icon + pulse */}
      <View style={styles.leftCol}>
        {/* pulse aura */}
        {!item.isRead && (
          <Animated.View
            style={[
              styles.pulseAura,
              {
                transform: [{ scale }],
                backgroundColor: grad[1],
                opacity,
              },
            ]}
          />
        )}

        {/* icon ring */}
        <LinearGradient
          colors={grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconRing}
        >
          <View
            style={[
              styles.iconInner,
              { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" },
            ]}
          >
            <Ionicons name={TYPE_ICON[item.type]} size={18} color={grad[1]} />
          </View>
        </LinearGradient>
      </View>

      {/* content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          {!item.isRead && (
            <View
              style={[
                styles.newDot,
                { backgroundColor: grad[1], shadowColor: grad[1] },
              ]}
            />
          )}
          <Text
            numberOfLines={2}
            style={[
              styles.title,
              { color: C.cardForeground ?? C.foreground },
              !item.isRead && { fontWeight: "900" }, // đậm hơn khi chưa đọc
            ]}
          >
            {item.title}
          </Text>

          {/* NEW badge */}
          {!item.isRead && (
            <LinearGradient
              colors={[`${grad[0]}`, `${grad[1]}`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badge}
            >
              <Text style={styles.badgeTxt}>MỚI</Text>
            </LinearGradient>
          )}
        </View>

        {!!item.message && (
          <Text
            numberOfLines={2}
            style={[
              styles.msg,
              { color: C.mutedForeground },
              !item.isRead && { color: isDark ? "#E5E7EB" : "#334155" }, // tăng tương phản chưa đọc
            ]}
          >
            {String(item.message).replace(/\s+/g, " ").trim()}
          </Text>
        )}

        <View style={styles.metaRow}>
          <Text style={[styles.metaTxt, { color: C.mutedForeground }]}>
            {fromNow(item.date)}
          </Text>
          <View style={styles.dot} />
          <Text style={[styles.metaTxt, { color: C.mutedForeground }]}>
            {TYPE_LABEL[item.type]}
          </Text>
          <View style={{ flex: 1 }} />
          <Ionicons name="chevron-forward" size={16} color={C.muted} />
        </View>
      </View>
    </Pressable>
  );
};

export default memo(NotificationCard);

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    overflow: "hidden",
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  accent: { width: 6, opacity: 0.95 },
  leftCol: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 12,
    width: 64,
  },
  pulseAura: {
    position: "absolute",
    top: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  iconRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1, paddingVertical: 12, paddingRight: 12, paddingLeft: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  title: { fontSize: 16, letterSpacing: 0.2, flex: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeTxt: {
    color: "#fff",
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  msg: { marginTop: 6, fontSize: 13.5, lineHeight: 20 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  metaTxt: { fontSize: 12.5, fontWeight: "700" },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
    backgroundColor: "#94A3B8",
  },
});
