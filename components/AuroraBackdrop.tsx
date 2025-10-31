// AuroraBackdrop.tsx
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";

const { width: W, height: H } = Dimensions.get("window");

export default function AuroraBackdrop({
  scheme,
}: {
  scheme: "light" | "dark";
}) {
  const t1 = useRef(new Animated.Value(0)).current;
  const t2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (val: Animated.Value, d = 9000, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: 1,
            duration: d,
            delay,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: d,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    loop(t1, 10000, 0);
    loop(t2, 12000, 800);
  }, []);

  const c1 =
    scheme === "dark"
      ? ["#0b1020", "#17153B", "#1F2544"]
      : ["#F5F3FF", "#E0EAFF", "#E8FDF5"];
  const blob = (
    v: Animated.Value,
    dx: number,
    dy: number,
    size = Math.max(W, H) * 0.9
  ) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    transform: [
      {
        translateX: v.interpolate({
          inputRange: [0, 1],
          outputRange: [dx, -dx],
        }),
      },
      {
        translateY: v.interpolate({
          inputRange: [0, 1],
          outputRange: [dy, -dy],
        }),
      },
      {
        rotate: v.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "25deg"],
        }) as any,
      },
    ],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={c1}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Aurora blobs */}
      <Animated.View style={[styles.blob, blob(t1, W * 0.15, -H * 0.08)]}>
        <LinearGradient
          colors={["#80EEC0AA", "#60A5FA88", "#A78BFA66"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View
        style={[styles.blob, blob(t2, -W * 0.1, H * 0.1, Math.max(W, H))]}
      >
        <LinearGradient
          colors={["#FDE68A99", "#F472B677", "#22D3EE66"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* film overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor:
              scheme === "dark" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)",
          },
        ]}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  blob: { position: "absolute", top: -H * 0.2, left: -W * 0.2, opacity: 0.55 },
});
