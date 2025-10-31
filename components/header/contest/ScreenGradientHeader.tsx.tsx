// components/header/contest/ScreenGradientHeader.tsx
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

export default function ScreenGradientHeader({
  title = "Contest",
  subtitle = "Khám phá & tham gia cuộc thi nghệ thuật",
  colors,
}: {
  title?: string;
  subtitle?: string;
  colors: string[];
}) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={s.wrap}
    >
      <View style={s.inner}>
        <Text style={s.title}>{title}</Text>
        {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingTop: Platform.select({ ios: 52, android: 16, default: 16 }),
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  inner: { flexDirection: "column" },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  subtitle: {
    marginTop: 4,
    color: "rgba(255,255,255,0.95)",
    fontSize: 13.5,
    fontWeight: "700",
  },
});
