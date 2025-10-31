// components/cards/guardian/AchievementCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

export type ColorTokens = {
  card: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  ring?: string;
};

type Props = {
  C: ColorTokens;
  title: string;
  place: string;
  onPress?: () => void;
};

// 🌶 Màu bạn cung cấp (đổi nếu hex khác)
const BRAND = "#DC5A54"; // đỏ cam từ ảnh bạn gửi

const AchievementCard = ({ C, title, place, onPress }: Props) => {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        android_ripple={{ color: BRAND + "22" }}
        style={[
          styles.card,
          {
            backgroundColor: C.card,
            borderColor: C.ring ?? "rgba(0,0,0,0.08)",
            shadowColor: "#000",
          },
        ]}
      >
        {/* Huy hiệu cúp: viền gradient, nền trong, icon nổi rõ */}
        <View style={styles.medalWrap}>
          {/* vòng sáng gradient mỏng */}
          <LinearGradient
            colors={[BRAND + "66", BRAND + "00"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.medalGlow}
            pointerEvents="none"
          />
          {/* lõi trong suốt theo màu card, KHÔNG che icon */}
          <View
            style={[
              styles.medalCore,
              { backgroundColor: C.card, borderColor: BRAND + "40" },
            ]}
          >
            {/* chấm nền mờ sau icon để tạo chiều sâu */}
            <View
              style={[styles.badgeCircle, { backgroundColor: BRAND + "18" }]}
            />
            <Ionicons name="trophy" size={20} color={BRAND} />
          </View>
        </View>

        {/* Texts */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={[styles.title, { color: C.foreground }]}
            numberOfLines={2}
          >
            {title}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons
              name="location-outline"
              size={13}
              color={C.mutedForeground}
            />
            <Text
              style={[styles.place, { color: C.mutedForeground }]}
              numberOfLines={1}
            >
              {place}
            </Text>
          </View>
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={18} color={C.mutedForeground} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    marginBottom: 10,
  },

  // Medal
  medalWrap: { width: 50, height: 50, position: "relative" },
  medalGlow: {
    position: "absolute",
    inset: 0,
    borderRadius: 25,
  },
  medalCore: {
    position: "absolute",
    inset: 4,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    overflow: "hidden",
  },
  badgeCircle: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
  },

  title: {
    fontSize: 15.5,
    fontWeight: "800",
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  place: {
    fontSize: 12.5,
    includeFontPadding: false,
  },
});

export default AchievementCard;
