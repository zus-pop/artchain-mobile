// components/contest/DetailHeader.tsx
import { Colors } from "@/constants/theme";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

export default function DetailHeader({
  scheme,
  title,
  onBack,
}: {
  scheme: "light" | "dark";
  title: string;
  onBack: () => void;
}) {
  const C = Colors[scheme];
  const s = styles(C);

  return (
    <View style={s.wrap}>
      {/* decor */}
      <View style={s.accentWrap}>
        <View
          style={[
            s.blob,
            {
              backgroundColor: C.chart1,
              left: -40,
              top: -25,
              transform: [{ rotate: "-10deg" }],
              opacity: 0.18,
            },
          ]}
        />
        <View
          style={[
            s.blob,
            {
              backgroundColor: C.chart3,
              right: -50,
              top: -18,
              transform: [{ rotate: "14deg" }],
              opacity: 0.14,
            },
          ]}
        />
        <View style={s.rainbowRow}>
          <View style={[s.rainbowBar, { backgroundColor: C.chart1 }]} />
          <View style={[s.rainbowBar, { backgroundColor: C.accent }]} />
          <View style={[s.rainbowBar, { backgroundColor: C.chart3 }]} />
          <View style={[s.rainbowBar, { backgroundColor: C.primary }]} />
        </View>
      </View>

      {/* glass for readability */}
      <View style={s.glass} />

      <View style={s.content}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [
            s.backBtn,
            { opacity: pressed ? 0.8 : 1, backgroundColor: C.card },
          ]}
          android_ripple={{ color: C.border }}
        >
          <ChevronLeft size={22} color={C.cardForeground} />
        </Pressable>

        <Text style={s.title} numberOfLines={1}>
          {title || "Chi tiết cuộc thi"}
        </Text>

        {/* spacer để cân layout */}
        <View style={{ width: 40 }} />
      </View>
    </View>
  );
}

const styles = (C: any) =>
  StyleSheet.create({
    wrap: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      paddingTop: Platform.select({ ios: 54, android: 22, default: 22 }),
      paddingBottom: 10,
      paddingHorizontal: 14,
      zIndex: 20,
    },
    accentWrap: {
      ...StyleSheet.absoluteFillObject,
      overflow: "hidden",
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    glass: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: C.card + (C.card?.length === 7 ? "D9" : ""),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    blob: {
      position: "absolute",
      width: 160,
      height: 80,
      borderRadius: 24,
    },
    rainbowRow: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      flexDirection: "row",
      opacity: 0.9,
    },
    rainbowBar: { flex: 1 },

    content: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    title: {
      flex: 1,
      color: C.cardForeground,
      fontSize: 18,
      fontWeight: "900",
      letterSpacing: 0.3,
    },
  });
