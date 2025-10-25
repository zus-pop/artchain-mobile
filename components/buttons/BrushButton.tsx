import React, { useEffect, useRef } from "react";
import {
  AccessibilityRole,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Svg, {
  ClipPath,
  Defs,
  G,
  Path,
  Rect,
  Stop,
  LinearGradient as SvgLinear,
} from "react-native-svg";

/* -------------------------- Haptics (optional) -------------------------- */
let Haptics: any;
try {
  Haptics = require("expo-haptics");
} catch {}

/* ------------------------------- Types ---------------------------------- */
type PaletteName = "pastel" | "rainbow" | "neon";
type SizeName = "md" | "lg";
type Variant = "flat" | "outline" | "ghost";

type Props = {
  title: string;
  onPress?: () => void;
  onLongPress?: () => void;
  palette?: PaletteName;
  size?: SizeName;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
  rounded?: number;
  textStyle?: TextStyle;
  haptics?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;

  /* NEW */
  shine?: boolean; // vệt sáng sweep khi nhấn (mặc định true)
  drift?: boolean; // gradient drift nhẹ (mặc định true)
  focusRing?: boolean; // vòng sáng khi press (mặc định true)
  contrastText?: boolean; // auto set text color theo nền (mặc định true)
};

const PALETTES: Record<PaletteName, string[]> = {
  pastel: ["#FADADD", "#A7E6FF", "#FFF8B5"],
  rainbow: ["#4FACFE", "#6B57FF", "#FF61D2"],
  neon: ["#00FFC6", "#FF3CAC", "#562B7C"],
};

const SIZES: Record<
  SizeName,
  {
    h: number;
    width: number;
    radius: number;
    fontSize: number;
    paddingX: number;
  }
> = {
  md: { h: 52, width: 220, radius: 26, fontSize: 16, paddingX: 18 },
  lg: { h: 64, width: 270, radius: 32, fontSize: 18, paddingX: 22 },
};

const BRUSH_PATH =
  "M10,40 C25,15 60,5 100,15 C140,25 170,25 210,15 C250,5 280,15 292,30 C296,38 298,45 295,52 C290,64 270,74 235,70 C200,66 180,66 155,70 C130,74 95,76 65,68 C35,60 15,55 8,50 C5,48 5,44 10,40 Z";

/* --- helper contrast --- */
function getReadable(colorHexes: string[], fallback = "#FFFFFF") {
  // Lấy màu giữa làm đại diện để đo độ sáng
  const hex = colorHexes[1] ?? colorHexes[0];
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#111" : fallback; // nền sáng → text đậm
}

export default function BrushButton({
  title,
  onPress,
  onLongPress,
  palette = "pastel",
  size = "lg",
  loading = false,
  disabled = false,
  style,
  leftIcon,
  rightIcon,
  variant = "flat",
  fullWidth = false,
  rounded,
  textStyle,
  haptics = true,
  accessibilityLabel,
  accessibilityRole = "button",
  shine = true,
  drift = true,
  focusRing = true,
  contrastText = true,
}: Props) {
  const { h, width, radius, fontSize, paddingX } = SIZES[size];
  const colors = PALETTES[palette];
  const textColor = contrastText ? getReadable(colors) : "#fff";

  /* -------------------------- Interactions -------------------------- */
  const scale = useRef(new Animated.Value(1)).current;
  const pressOverlay = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  const animateTo = (val: number) =>
    Animated.spring(scale, {
      toValue: val,
      useNativeDriver: true,
      bounciness: 10,
      speed: 20,
    });

  const handleIn = () => {
    animateTo(0.97).start();
    Animated.timing(pressOverlay, {
      toValue: 1,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    if (focusRing) {
      ring.stopAnimation();
      ring.setValue(0);
      Animated.timing(ring, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  };

  const handleOut = () => {
    animateTo(1).start();
    Animated.timing(pressOverlay, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();

    if (focusRing) {
      Animated.timing(ring, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (disabled || loading) return;
    if (haptics && Haptics?.selectionAsync) Haptics.selectionAsync();
    onPress?.();
  };

  const handleLongPress = () => {
    if (disabled || loading) return;
    if (haptics && Haptics?.impactAsync)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLongPress?.();
  };

  /* --------------------- Animated gradient drift --------------------- */
  const driftAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!drift || variant !== "flat") return;
    const loop = Animated.loop(
      Animated.timing(driftAnim, {
        toValue: 1,
        duration: 5000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false, // cần giá trị để set vào props SVG
      })
    );
    loop.start();
    return () => loop.stop();
  }, [drift, variant]);

  // map 0→1 => tx -20→20 (dịch gradient)
  const gradTranslate = driftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 20],
  });

  /* ----------------------------- Render ----------------------------- */
  const containerStyle: ViewStyle = {
    height: h,
    width: fullWidth ? "100%" : width,
    borderRadius: rounded ?? radius,
    opacity: disabled ? 0.6 : 1,
  };

  // focus ring style
  const ringStyle = {
    opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
    transform: [
      {
        scale: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }),
      },
    ],
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      {/* Focus ring layer */}
      {focusRing && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: rounded ?? radius,
              shadowColor: colors[1],
              ...(Platform.OS === "ios"
                ? {
                    shadowOpacity: 0.35,
                    shadowRadius: 14,
                    shadowOffset: { width: 0, height: 6 },
                  }
                : { elevation: 0 }),
            },
            ringStyle,
          ]}
        />
      )}

      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handleIn}
        onPressOut={handleOut}
        disabled={disabled || loading}
        android_ripple={
          variant === "ghost" ? undefined : { color: "rgba(255,255,255,0.18)" }
        }
        accessibilityRole={accessibilityRole}
        accessibilityState={{ disabled, busy: loading }}
        accessibilityLabel={accessibilityLabel ?? title}
        style={[
          styles.btn,
          containerStyle,
          variant === "ghost" && {
            borderWidth: 1.5,
            borderColor: "rgba(255,255,255,0.35)",
          },
        ]}
      >
        {/* SVG nền (gradient drift + inner stroke + clip sheen) */}
        <View style={StyleSheet.absoluteFill}>
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 300 80"
            preserveAspectRatio="none"
          >
            <Defs>
              <SvgLinear
                id="g"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
                gradientTransform={
                  variant === "flat"
                    ? `translate(${Number(gradTranslate) || 0},0)`
                    : undefined
                }
              >
                <Stop offset="0%" stopColor={colors[0]} />
                <Stop offset="60%" stopColor={colors[1]} />
                <Stop offset="100%" stopColor={colors[2]} />
              </SvgLinear>

              <ClipPath id="clip">
                <Path d={BRUSH_PATH} />
              </ClipPath>
            </Defs>

            {/* Fill */}
            {variant !== "ghost" && (
              <Path
                d={BRUSH_PATH}
                fill={variant === "flat" ? "url(#g)" : "#ffffff12"}
              />
            )}

            {/* Inner stroke siêu mảnh cho nét sắc */}
            <Path
              d={BRUSH_PATH}
              fill="transparent"
              stroke={
                variant === "flat"
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(255,255,255,0.55)"
              }
              strokeWidth={variant === "flat" ? 1 : 2}
            />

            {/* Sheen quét khi nhấn (sweep rect clip trong path) */}
            {shine && (
              <G clipPath="url(#clip)">
                {/* overlay base (dùng Animated.View bên ngoài điều khiển opacity khi press) */}
                <Rect
                  x={0}
                  y={0}
                  width={300}
                  height={80}
                  fill="rgba(255,255,255,0.06)"
                />
              </G>
            )}
          </Svg>
        </View>

        {/* Overlay sáng khi nhấn */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: rounded ?? radius,
              backgroundColor: "rgba(255,255,255,0.08)",
              opacity: pressOverlay,
            },
          ]}
        />

        {/* Nội dung */}
        <View
          style={[
            styles.row,
            {
              paddingHorizontal: paddingX,
              height: h,
              borderRadius: rounded ?? radius,
            },
          ]}
        >
          {leftIcon ? (
            <View style={{ marginRight: 10 }}>{leftIcon}</View>
          ) : null}

          {loading ? (
            <ActivityIndicator color={textColor} />
          ) : (
            <Text
              numberOfLines={1}
              style={[styles.text, { fontSize, color: textColor }, textStyle]}
            >
              {title}
            </Text>
          )}

          {rightIcon ? (
            <View style={{ marginLeft: 10 }}>{rightIcon}</View>
          ) : null}
        </View>

        {/* Desaturate nhẹ khi disabled */}
        {disabled && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: "rgba(0,0,0,0.06)",
                borderRadius: rounded ?? radius,
              },
            ]}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    overflow: Platform.OS === "android" ? "hidden" : "visible",
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontWeight: "700",
    letterSpacing: 0.6,
  },
});
