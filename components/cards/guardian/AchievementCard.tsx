import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

// ---------- Types ----------
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
  place: string; // "1st place • City Marathon"
  onPress?: () => void;
  rank?: number; // 1,2,3 => gold/silver/bronze
  caption?: string;
  tone?: "pink" | "mint" | "sky" | "lavender";
  cute?: boolean; // thêm sticker trái tim/sao 😽
};

// ---------- Palettes ----------
const MEDAL: Record<
  number,
  { from: string; to: string; icon: string; text: string }
> = {
  1: { from: "#FDE68A", to: "#F59E0B", icon: "trophy", text: "GOLD" },
  2: { from: "#E5E7EB", to: "#9CA3AF", icon: "trophy", text: "SILVER" },
  3: { from: "#FDBA74", to: "#F97316", icon: "trophy", text: "BRONZE" },
};

const PASTEL: Record<NonNullable<Props["tone"]>, [string, string, string]> = {
  pink: ["#FDE2E4", "#FAD2E1", "#FBCFE8"],
  mint: ["#D1FAE5", "#A7F3D0", "#BBF7D0"],
  sky: ["#DBEAFE", "#BFDBFE", "#BAE6FD"],
  lavender: ["#EDE9FE", "#DDD6FE", "#E9D5FF"],
};

// ---------- Component ----------
const AchievementCard = ({
  C,
  title,
  place,
  onPress,
  rank,
  caption,
  tone = "lavender",
  cute = true,
}: Props) => {
  const medal = useMemo(() => MEDAL[rank ?? 0], [rank]);
  const [p0, p1, p2] = PASTEL[tone];

  // Press feedback
  const scale = useRef(new Animated.Value(1)).current;
  const handleIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  const handleOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();

  // Medal bobbing
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);
  const bobT = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });

  // Shine sweep
  const shine = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shine, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(shine, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shine]);
  const translateX = shine.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 260],
  });
  const opacity = shine.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.55, 0],
  });

  // Tiny star ring rotation
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handleIn}
        onPressOut={handleOut}
        android_ripple={{ color: C.primary + "22" }}
      >
        {/* Outer pastel mesh ring */}
        <LinearGradient
          colors={[p0, p1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ring}
        >
          {/* Inner soft border (glass ring) */}
          <View style={styles.innerRing} />

          {/* Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: C.card, shadowColor: "#000" },
            ]}
          >
            {/* Mesh orbs (background) */}
            <View
              style={[
                styles.orb,
                { backgroundColor: p2 + "88", top: -24, left: -10 },
              ]}
            />
            <View
              style={[
                styles.orb,
                { backgroundColor: p1 + "66", bottom: -28, right: -20 },
              ]}
            />
            <View
              style={[
                styles.orbSm,
                { backgroundColor: p0 + "77", top: 8, right: 48 },
              ]}
            />

            {/* Top glossy highlight */}
            <LinearGradient
              colors={["#ffffff66", "#ffffff00"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gloss}
            />

            {/* Left: Medal + star ring */}
            <Animated.View
              style={[styles.iconWrap, { transform: [{ translateY: bobT }] }]}
            >
              {medal ? (
                <LinearGradient
                  colors={[medal.from, medal.to] as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.icon}
                >
                  <Ionicons
                    name={medal.icon as any}
                    size={24}
                    color="#111827"
                  />
                </LinearGradient>
              ) : (
                <View
                  style={[styles.icon, { backgroundColor: C.primary + "15" }]}
                >
                  <Ionicons name="trophy" size={24} color={C.primary} />
                </View>
              )}

              {/* Rotating stars ring */}
              <Animated.View
                style={[styles.starRing, { transform: [{ rotate }] }]}
              >
                <Ionicons
                  name="star"
                  size={9}
                  color={C.primary}
                  style={{ opacity: 0.9 }}
                />
                <Ionicons
                  name="star"
                  size={8}
                  color={C.primary}
                  style={{ opacity: 0.6 }}
                />
                <Ionicons
                  name="star"
                  size={7}
                  color={C.primary}
                  style={{ opacity: 0.5 }}
                />
              </Animated.View>

              {/* Cute sticker (optional) */}
              {cute && (
                <LinearGradient
                  colors={
                    [C.primary + "60", C.primary + "30"] as [string, string]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ribbon}
                >
                  <Ionicons name="heart" size={10} color="#fff" />
                </LinearGradient>
              )}
            </Animated.View>

            {/* Center: Texts */}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={[styles.title, { color: C.foreground }]}
                numberOfLines={1}
              >
                {title}
              </Text>
              <Text
                style={[styles.place, { color: C.mutedForeground }]}
                numberOfLines={2}
              >
                {place}
              </Text>
              {!!caption && (
                <Text
                  style={[styles.caption, { color: C.mutedForeground }]}
                  numberOfLines={1}
                >
                  {caption}
                </Text>
              )}
            </View>

            {/* Right: Rank badge */}
            <View style={styles.badgeWrap}>
              <LinearGradient
                colors={
                  medal
                    ? ([medal.from, medal.to] as [string, string])
                    : ([C.primary + "33", C.primary + "66"] as [string, string])
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.badge}
              >
                <Text style={styles.badgeText}>
                  {rank ? `#${rank}` : "NEW"}
                </Text>
                {medal?.text ? (
                  <Text style={styles.badgeSub}>{medal.text}</Text>
                ) : null}
              </LinearGradient>
            </View>

            {/* Moving shine */}
            <Animated.View
              style={[styles.shine, { opacity, transform: [{ translateX }] }]}
            />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

// ---------- Styles ----------
const styles = StyleSheet.create({
  ring: {
    borderRadius: 22,
    padding: 1.8,
    marginBottom: 14,
  },
  innerRing: {
    position: "absolute",
    inset: 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    opacity: 0.6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 16,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    overflow: "hidden",
  },

  // Background mesh
  orb: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 90,
    filter: "blur(2px)" as any,
  },
  orbSm: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 50,
    filter: "blur(1px)" as any,
  },

  // Gloss highlight
  gloss: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 36,
    opacity: 0.8,
  },

  // Medal
  iconWrap: { marginRight: 12 },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  starRing: {
    position: "absolute",
    left: -10,
    top: -6,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "space-between",
    transform: [{ rotate: "0deg" }],
  },
  ribbon: {
    position: "absolute",
    bottom: -2,
    right: -6,
    width: 22,
    height: 18,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "14deg" }],
  },

  // Texts
  title: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.25,
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.06)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  place: { fontSize: 13.5, lineHeight: 18 },
  caption: { fontSize: 12, marginTop: 6 },

  // Badge
  badgeWrap: { marginLeft: 12 },
  badge: {
    minWidth: 66,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  badgeText: {
    color: "#111827",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  badgeSub: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 0.2,
    opacity: 0.85,
  },

  // Shine
  shine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 80,
    transform: [{ rotate: "20deg" }],
    backgroundColor: "rgba(255,255,255,0.85)",
  },
});

export default AchievementCard;
