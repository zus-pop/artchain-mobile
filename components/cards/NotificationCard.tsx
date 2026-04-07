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

// Tone cam chủ đạo – gọn, vuông vức
const TYPE_GRAD: Record<NotificationItem["type"], [string, string]> = {
  contest: ["#FDBA74", "#F97316"],
  submission: ["#FED7AA", "#F97316"],
  result: ["#FB923C", "#EA580C"],
  system: ["#FACC15", "#FB923C"],
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
    outputRange: [1, 1.12],
  });
  const auraOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.22, 0],
  });

  const unreadShadow = item.isRead ? 0 : 0.18;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: C.muted }}
      style={({ pressed }) => [
        styles.wrap,
        {
          backgroundColor: isDark ? "#020617" : "#FFFBEB",
          borderColor: item.isRead ? "#FED7AA" : `${grad[1]}AA`,
          opacity: pressed ? 0.97 : 1,
          shadowColor: item.isRead ? (isDark ? "#000" : "#111827") : grad[1],
          shadowOpacity: item.isRead ? 0.04 : unreadShadow,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${TYPE_LABEL[item.type]}: ${item.title}${
        item.isRead ? "" : ", chưa đọc"
      }`}
    >
      {/* Icon column – gọn, vuông, chính giữa */}
      <View style={styles.leftCol}>
        {!item.isRead && (
          <Animated.View
            style={[
              styles.pulseAura,
              {
                transform: [{ scale }],
                backgroundColor: grad[1],
                opacity: auraOpacity,
              },
            ]}
          />
        )}

        <LinearGradient
          colors={grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconRing}
        >
          <View
            style={[
              styles.iconInner,
              { backgroundColor: isDark ? "#020617" : "#FFF7ED" },
            ]}
          >
            <Ionicons name={TYPE_ICON[item.type]} size={18} color={grad[1]} />
          </View>
        </LinearGradient>
      </View>

      {/* Content column */}
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
              {
                color: isDark ? "#F9FAFB" : "#1F2933",
                fontWeight: item.isRead ? "800" : "900",
              },
            ]}
          >
            {item.title}
          </Text>

          {!item.isRead && (
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>MỚI</Text>
            </View>
          )}
        </View>

        {!!item.message && (
          <Text
            numberOfLines={2}
            style={[
              styles.msg,
              {
                color: item.isRead
                  ? isDark
                    ? "#9CA3AF"
                    : "#4B5563"
                  : isDark
                  ? "#E5E7EB"
                  : "#374151",
              },
            ]}
          >
            {String(item.message).replace(/\s+/g, " ").trim()}
          </Text>
        )}

        <View style={styles.metaRow}>
          <Text
            style={[styles.metaTxt, { color: isDark ? "#9CA3AF" : "#6B7280" }]}
          >
            {fromNow(item.date)}
          </Text>
          <View style={styles.dot} />
          <Text
            style={[styles.metaTxt, { color: isDark ? "#9CA3AF" : "#6B7280" }]}
          >
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
    borderRadius: 12, // vuông vức, không quá bo
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    overflow: "hidden",
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  leftCol: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  pulseAura: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  iconRing: {
    width: 40,
    height: 40,
    borderRadius: 12, // icon block vuông hơn
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 12,
    paddingLeft: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
  },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  title: {
    flex: 1,
    fontSize: 15.5,
    letterSpacing: 0.1,
    fontFamily: "Be Vietnam Pro",
  },

  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#F97316",
  },
  badgeTxt: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.3,
    fontFamily: "Be Vietnam Pro",
  },

  msg: {
    marginTop: 4,
    fontSize: 13.5,
    lineHeight: 19,
    fontFamily: "Be Vietnam Pro",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
    marginTop: 8,
  },
  metaTxt: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Be Vietnam Pro",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FDBA74",
    opacity: 0.7,
  },
});
