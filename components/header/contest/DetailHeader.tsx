// components/contest/DetailHeader.tsx
import { Colors } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, Sparkles } from "lucide-react-native";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  scheme: "light" | "dark";
  title?: string;
  onBack: () => void;
  /** tùy chọn */
  subtitle?: string;
  onRightPress?: () => void;
};

export default function DetailHeader({
  scheme,
  title,
  onBack,
  subtitle,
  onRightPress,
}: Props) {
  const C = Colors[scheme];
  const s = styles(C);

  return (
    <View style={s.wrap}>
      {/* Nền gradient artist + blob décor */}
      <LinearGradient
        colors={[C.chart1, C.accent, C.chart3]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.gradientBg}
      >
        {/* Blobs */}
        <View
          style={[
            s.blob,
            {
              backgroundColor: C.chart1,
              left: -36,
              top: -22,
              opacity: 0.18,
              transform: [{ rotate: "-12deg" }],
            },
          ]}
        />
        <View
          style={[
            s.blob,
            {
              backgroundColor: C.chart3,
              right: -48,
              top: -18,
              opacity: 0.14,
              transform: [{ rotate: "16deg" }],
            },
          ]}
        />
        {/* Rainbow bar mảnh ở đáy */}
        <View style={s.rainbowRow}>
          <View style={[s.rainbowBar, { backgroundColor: C.chart1 }]} />
          <View style={[s.rainbowBar, { backgroundColor: C.accent }]} />
          <View style={[s.rainbowBar, { backgroundColor: C.chart3 }]} />
          <View style={[s.rainbowBar, { backgroundColor: C.primary }]} />
        </View>

        {/* Lớp “glass” mờ nhẹ để nội dung nổi rõ hơn */}
        <View
          style={[
            s.glass,
            { backgroundColor: C.card + (C.card?.length === 7 ? "B8" : "") },
          ]}
        />

        {/* Content */}
        <View style={s.content}>
          {/* Back */}
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              s.iconBtn,
              {
                backgroundColor: C.card,
                borderColor: C.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            android_ripple={{ color: C.border }}
            hitSlop={8}
          >
            <ChevronLeft size={22} color={C.cardForeground} />
          </Pressable>

          {/* Title group */}
          <View style={s.titleGroup}>
            <Text style={s.title} numberOfLines={1}>
              {title || "Chi tiết cuộc thi"}
            </Text>
            {subtitle ? (
              <Text style={s.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          {/* Right action (tùy chọn) */}
          {onRightPress ? (
            <Pressable
              onPress={onRightPress}
              style={({ pressed }) => [
                s.iconBtn,
                {
                  backgroundColor: C.card,
                  borderColor: C.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
              android_ripple={{ color: C.border }}
              hitSlop={8}
            >
              <Sparkles size={20} color={C.cardForeground} />
            </Pressable>
          ) : (
            // spacer để cân layout nếu không có nút phải
            <View style={{ width: 40 }} />
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

type StyleMap = {
  wrap: ViewStyle;
  gradientBg: ViewStyle;
  glass: ViewStyle;
  blob: ViewStyle;
  rainbowRow: ViewStyle;
  rainbowBar: ViewStyle;
  content: ViewStyle;
  iconBtn: ViewStyle;
  titleGroup: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
};

const styles = (C: any) =>
  StyleSheet.create<StyleMap>({
    wrap: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 20,
      // không padding trực tiếp ở đây, để trong gradientBg
    },
    gradientBg: {
      paddingTop: Platform.select({ ios: 54, android: 22, default: 22 }),
      paddingBottom: 12,
      paddingHorizontal: 14,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      overflow: "hidden",
      // shadow cho iOS, elevation cho Android đã có layer bên trong
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    glass: {
      ...StyleSheet.absoluteFillObject,
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
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    titleGroup: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      color: C.cardForeground,
      fontSize: 18,
      fontWeight: "900",
      letterSpacing: 0.3,
    },
    subtitle: {
      marginTop: 2,
      color: C.mutedForeground,
      fontSize: 12.5,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
  });
