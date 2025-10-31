// FancyAnnouncement.tsx (thay component cũ)
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
const W = require("react-native").Dimensions.get("window").width;

export default function FancyAnnouncement({ a, onPress, index }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const tilt = useRef(new Animated.Value(0)).current; // -1..1

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      bounciness: 6,
    }).start();
  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 8,
    }).start();

  // nhẹ: tự tilt theo index để tạo nhịp (không cần scrollX)
  Animated.timing(tilt, {
    toValue: (index % 2 === 0 ? 1 : -1) * 0.15,
    duration: 450,
    easing: Easing.inOut(Easing.quad),
    useNativeDriver: true,
  }).start();

  const rotation = tilt.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-2.2deg", "2.2deg"],
  });
  const typeChip =
    a.type === "contest"
      ? { label: "Cuộc thi", color: "#22C55E" }
      : { label: "Kết quả", color: "#F59E0B" };

  return (
    <Animated.View
      style={[
        f.cardWrap,
        { transform: [{ scale }, { rotate: rotation as any }] },
      ]}
    >
      <LinearGradient
        colors={["#ffffff33", "#ffffff00"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={f.borderOverlay}
      />
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
        style={({ pressed }) => [f.press, pressed && { opacity: 0.98 }]}
      >
        <ImageBackground
          source={{ uri: a.image }}
          resizeMode="cover"
          style={f.card}
          imageStyle={{ borderRadius: 18 }}
        >
          {/* blur glass */}
          <LinearGradient
            colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.65)"]}
            start={{ x: 0, y: 0.2 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* chips */}
          <View style={f.topRow}>
            <View style={[f.chip, { backgroundColor: `${typeChip.color}E6` }]}>
              <Ionicons
                name={a.type === "contest" ? "trophy" : "checkmark-done"}
                size={12}
                color="#fff"
              />
              <Text style={f.chipTxt}>{typeChip.label}</Text>
            </View>
            <View style={[f.chip, f.chipGlass]}>
              <Ionicons name="calendar-outline" size={12} color="#fff" />
              <Text style={f.chipTxt}>
                {new Date(a.date).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* content */}
          <View style={f.bottom}>
            <Text numberOfLines={2} style={f.title}>
              {a.title}
            </Text>
            <Text numberOfLines={2} style={f.summary}>
              {a.summary}
            </Text>

            <View style={f.ctaRow}>
              <View style={f.ctaGhost}>
                <Ionicons name="eye-outline" size={14} color="#fff" />
                <Text style={f.ctaGhostTxt}>Chi tiết</Text>
              </View>
              <LinearGradient
                colors={["#FDE68A", "#F59E0B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={f.ctaPrimary}
              >
                <Ionicons name="chevron-forward" size={14} color="#111827" />
              </LinearGradient>
            </View>
          </View>
        </ImageBackground>
      </Pressable>
    </Animated.View>
  );
}

const CARD_W = W * 0.82;
const f = StyleSheet.create({
  cardWrap: { width: CARD_W, marginRight: 14 },
  press: { borderRadius: 18, overflow: "hidden" },
  borderOverlay: {
    position: "absolute",
    left: 0,
    right: 14,
    top: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  card: {
    height: 190,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  topRow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipGlass: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  chipTxt: { color: "#fff", fontWeight: "800", fontSize: 12 },
  bottom: { position: "absolute", left: 12, right: 12, bottom: 10 },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  summary: { color: "rgba(255,255,255,0.92)", fontSize: 13, marginBottom: 12 },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ctaGhost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  ctaGhostTxt: { color: "#fff", fontWeight: "800", fontSize: 12 },
  ctaPrimary: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
