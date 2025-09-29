import React, { useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Svg, {
  Defs,
  Path,
  Stop,
  LinearGradient as SvgLinear,
} from "react-native-svg";

type PaletteName = "pastel" | "rainbow" | "neon";
type SizeName = "md" | "lg";

const PALETTES: Record<PaletteName, string[]> = {
  pastel: ["#FADADD", "#A7E6FF", "#FFF8B5"],
  rainbow: ["#4FACFE", "#6B57FF", "#FF61D2"],
  neon: ["#00FFC6", "#FF3CAC", "#562B7C"],
};

const SIZES: Record<SizeName, { h: number; width: number; radius: number; fontSize: number }> = {
  md: { h: 60, width: 220, radius: 30, fontSize: 18 },
  lg: { h: 80, width: 270, radius: 40, fontSize: 22 }, // Bigger and more artistic
};

export default function BrushButton({
  title,
  onPress,
  palette = "pastel",
  size = "lg",
  loading = false,
  disabled = false,
  style,
  leftIcon,
}: {
  title: string;
  onPress?: () => void;
  palette?: PaletteName;
  size?: SizeName;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  leftIcon?: React.ReactNode;
}) {
  const { h, width, radius, fontSize } = SIZES[size];
  const colors = PALETTES[palette];

  const scale = useRef(new Animated.Value(1)).current;
  const handleIn = () =>
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      bounciness: 10,
    }).start();
  const handleOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 10,
    }).start();

  // Artistic Brush Path with a more intricate curve
  const brushPath = useMemo(
    () =>
      "M10,40 C25,15 60,5 100,15 C140,25 170,25 210,15 C250,5 280,15 292,30 C296,38 298,45 295,52 C290,64 270,74 235,70 C200,66 180,66 155,70 C130,74 95,76 65,68 C35,60 15,55 8,50 C5,48 5,44 10,40 Z",
    []
  );

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handleIn}
        onPressOut={handleOut}
        android_ripple={{ color: "rgba(255,255,255,0.15)" }}
        disabled={disabled || loading}
        style={[
          styles.btn,
          {
            height: h,
            width: width,
            borderRadius: radius,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {/* Artistic Background with SVG gradient */}
        <View style={StyleSheet.absoluteFill}>
          <Svg width="100%" height="100%" viewBox="0 0 300 80" preserveAspectRatio="none">
            <Defs>
              <SvgLinear id="g" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor={colors[0]} />
                <Stop offset="60%" stopColor={colors[1]} />
                <Stop offset="100%" stopColor={colors[2]} />
              </SvgLinear>
            </Defs>

            {/* Add shadow for depth */}
            <Path d={brushPath} fill="rgba(0,0,0,0.12)" transform="translate(0,3)" />

            {/* Main Gradient Layer */}
            <Path d={brushPath} fill="url(#g)" />

            {/* Light Border */}
            <Path d={brushPath} fill="transparent" stroke="rgba(255,255,255,0.75)" strokeWidth={2} />
          </Svg>
        </View>

        {/* Text and Icon */}
        <View style={styles.row}>
          {leftIcon ? <View style={{ marginRight: 10 }}>{leftIcon}</View> : null}
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.text, { fontSize, fontWeight: "700" }]} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    overflow: Platform.OS === "android" ? "hidden" : "visible",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2, // Adding border width for more emphasis
    borderColor: "rgba(255,255,255,0.6)", // White border color
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  text: {
    fontWeight: "800",
    color: "#fff", // White text color for better contrast
    letterSpacing: 1.5, // More letter spacing for elegance
    fontFamily: "DancingScript-Regular", // Using an artistic font
  },
});
