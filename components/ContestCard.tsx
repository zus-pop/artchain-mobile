// components/ContestCard.tsx
import { Award, Clock, FileText } from "lucide-react-native";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";


import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
/* ---------- Types ---------- */
export type Contest = {
  contestId?: string | number;
  id?: string | number;
  title?: string;
  description?: string;
  status?: "ACTIVE" | "UPCOMING" | "COMPLETED" | "ENDED" | "DRAFT" | string;
  numOfAward?: number;
  coverUrl?: string;
  startDate?: string;
  endDate?: string;
};

type Props = {
  contest: Contest;
  onPress?: () => void;
  index?: number; // for staggered appear animation
};

/* ---------- Component ---------- */
export function ContestCard({ contest, onPress, index = 0 }: Props) {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const s = styles(C);

  // Fake covers while BE doesn’t provide coverUrl
  const covers = useMemo(
    () => [
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1461344577544-4e5dc9487184?q=80&w=1600&auto=format&fit=crop",
    ],
    []
  );
  const cover =
    contest.coverUrl ||
    covers[
      Number(String(contest.contestId ?? contest.id ?? 0)) % covers.length
    ];

  const status = String(contest.status ?? "UPCOMING").toUpperCase();
  const statusText = getStatusText(status);

  const start = contest.startDate ? new Date(contest.startDate) : undefined;
  const end = contest.endDate ? new Date(contest.endDate) : undefined;
  const dateText =
    start && end ? `${fmtVN(start)} → ${fmtVN(end)}` : end ? fmtVN(end) : "—";

  /* ---------- Animations ---------- */
  const appearOpacity = useRef(new Animated.Value(0)).current;
  const appearTranslate = useRef(new Animated.Value(12)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const tilt = useRef(new Animated.Value(0)).current; // subtle 3D tilt
  const shine = useRef(new Animated.Value(0)).current; // title shimmer

  useEffect(() => {
    Animated.parallel([
      Animated.timing(appearOpacity, {
        toValue: 1,
        duration: 320,
        delay: index * 60,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(appearTranslate, {
        toValue: 0,
        duration: 320,
        delay: index * 60,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [appearOpacity, appearTranslate, index]);

  useEffect(() => {
    // looping shimmer
    const loop = () =>
      Animated.timing(shine, {
        toValue: 1,
        duration: 1800,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        shine.setValue(0);
        setTimeout(loop, 1200);
      });
    loop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPressIn = () =>
    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }),
      Animated.timing(tilt, {
        toValue: 1,
        duration: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

  const onPressOut = () =>
    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }),
      Animated.timing(tilt, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

  const rX = tilt.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "3deg"],
  });
  const rY = tilt.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-3deg"],
  });
  const shineTranslate = shine.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 160],
  });

  // gradient colors for status
  const statusGradient = getStatusGradient(status);

  return (
    <Animated.View
      style={{
        opacity: appearOpacity,
        transform: [{ translateY: appearTranslate }, { scale: pressScale }],
      }}
    >
      {/* Gradient Border Wrapper */}
      <LinearGradient
        colors={["#8A2BE2", "#FF4D6D", "#FFD166"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.borderWrap}
      >
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          android_ripple={{ color: C.border }}
          style={s.card}
        >
          {/* Cover with subtle tilt */}
          <Animated.View
            style={{ transform: [{ rotateX: rX }, { rotateY: rY }] }}
          >
            <ImageBackground
              source={{ uri: cover }}
              style={s.cover}
              imageStyle={s.coverImg}
            >
              <View style={s.overlay} />
              <View style={s.innerStroke} />

              {/* Status ribbon (gradient) */}
              <View style={s.badgeWrap}>
                <LinearGradient
                  colors={statusGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.badgeGradient}
                >
                  <Text style={s.badgeText}>{statusText}</Text>
                </LinearGradient>
              </View>

              {/* Award pill (glass) */}
              <View style={s.topRight}>
                <View style={s.awardPill}>
                  <Award size={14} color="#fff" />
                  <Text style={s.awardPillText}>{contest.numOfAward ?? 0}</Text>
                </View>
              </View>

              {/* Title pill with shimmer */}
              <View style={s.titlePill}>
                <Text style={s.title} numberOfLines={2}>
                  {contest.title || "Cuộc thi không tên"}
                </Text>
                <Animated.View
                  pointerEvents="none"
                  style={[
                    s.shineBar,
                    { transform: [{ translateX: shineTranslate }] },
                  ]}
                />
              </View>
            </ImageBackground>
          </Animated.View>

          {/* Body */}
          <View style={s.body}>
            {!!contest.description && (
              <View style={s.descRow}>
                <FileText size={14} color={C.mutedForeground} />
                <Text style={s.desc} numberOfLines={2}>
                  {contest.description}
                </Text>
              </View>
            )}

            <View style={s.metaRow}>
              <View style={s.timeChipFancy}>
                <Clock size={14} color="#fff" />
                <Text style={s.timeChipFancyText}>
                  {start && end ? dateText : `Hạn: ${dateText}`}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
}

/* ---------- Helpers ---------- */
function fmtVN(d: Date) {
  try {
    return d.toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
}
function getStatusText(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Đang diễn ra";
    case "UPCOMING":
      return "Sắp diễn ra";
    case "COMPLETED":
      return "Hoàn thành";
    case "ENDED":
      return "Đã kết thúc";
    case "DRAFT":
      return "Nháp";
    default:
      return status;
  }
}
function getStatusGradient(
  status: string
): [string, string] | [string, string, string] {
  switch (status) {
    case "ACTIVE":
      return ["#22c1c3", "#fdbb2d"]; // teal -> warm
    case "UPCOMING":
      return ["#6a11cb", "#2575fc"]; // purple -> blue
    case "COMPLETED":
      return ["#16a34a", "#65a30d"]; // green tones
    case "ENDED":
      return ["#6b7280", "#4b5563"]; // gray
    case "DRAFT":
      return ["#94a3b8", "#64748b"]; // slate
    default:
      return ["#6b7280", "#4b5563"];
  }
}

/* ---------- Styles ---------- */
const styles = (C: any) =>
  StyleSheet.create({
    // outer gradient border
    borderWrap: {
      borderRadius: 18,
      padding: 1.5,
      marginHorizontal: 12,
      marginBottom: 16,
    },

    card: {
      backgroundColor: C.card,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
      borderWidth: 0,
    },

    /* Cover */
    cover: { width: "100%", height: 200, justifyContent: "flex-end" },
    coverImg: { resizeMode: "cover" },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.22)", // subtle dark for readability
    },
    innerStroke: {
      ...StyleSheet.absoluteFillObject,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      borderRadius: 16,
    },

    /* Status badge */
    badgeWrap: { position: "absolute", left: 10, top: 10 },
    badgeGradient: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,255,255,0.25)",
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    badgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },

    /* Award pill */
    topRight: {
      position: "absolute",
      right: 10,
      top: 10,
      flexDirection: "row",
      gap: 8,
    },
    awardPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(255,255,255,0.14)",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.22)",
    },
    awardPillText: { color: "#fff", fontWeight: "900", fontSize: 12 },

    /* Title pill + shimmer */
    titlePill: {
      alignSelf: "flex-start",
      margin: 12,
      marginBottom: 14,
      backgroundColor: "rgba(0,0,0,0.50)",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      maxWidth: "92%",
      overflow: "hidden",
    },
    title: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "900",
      lineHeight: 22,
      letterSpacing: 0.2,
    },
    shineBar: {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: 48,
      backgroundColor: "rgba(255,255,255,0.16)",
      transform: [{ skewX: "-20deg" }],
      borderRadius: 8,
    },

    /* Body */
    body: { padding: 12, gap: 10, backgroundColor: C.card },

    descRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
    desc: { color: C.mutedForeground, lineHeight: 20, fontSize: 14, flex: 1 },

    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 2,
    },

    // lively time chip
    timeChipFancy: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: "#111827", // slate-900
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
    },
    timeChipFancyText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.2,
    },
  });
