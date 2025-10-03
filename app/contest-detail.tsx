import AnimatedSection, {
  sectionShadow,
} from "@/components/header/contest/AnimatedSection";
import DetailHeader from "@/components/header/contest/DetailHeader";
import MetaItem from "@/components/header/contest/MetaItem";
import ScheduleItem from "@/components/header/contest/ScheduleItem";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Palette } from "lucide-react-native";
import React, { useMemo, useRef } from "react";
import {
  Animated,
  ImageStyle,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

/** --------- SPACING ---------- */
const SPACE = {
  screen: 16,
  section: 12,
  between: 10,
} as const;

/** --------- VIVID (đậm & rõ) ---------- */
const VIVID = {
  blue: "#1E3A8A", // date
  sky: "#075985", // participants
  green: "#166534", // organizer
  red: "#991B1B", // location
  amber: "#92400E", // prize
};

/** --------- Types ---------- */
type ScheduleKind = "open" | "deadline" | "review" | "award";
type Schedule = { label: string; date: string; kind: ScheduleKind };
type Contest = {
  title: string;
  image: string;
  date: string;
  status: "Active" | "Upcoming" | "Closed";
  organizer: string;
  location: string;
  prize: string;
  participants: number;
  description: string;
  rules: string;
  schedule: Schedule[];
  tags: string[];
};

/** --------- Mock data ---------- */
const contestData = {
  "1": {
    title: "Summer Painting Contest",
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1600&q=80",
    date: "July 20, 2024",
    status: "Active",
    organizer: "ArtChain Foundation",
    location: "ArtChain Gallery, New York",
    prize: "$2,000 + Gallery Exhibition",
    participants: 120,
    description:
      "Join our summer painting contest and showcase your creativity! Open to all ages and styles. Submit your best work and stand a chance to win exciting prizes. Deadline: July 20, 2024.",
    rules:
      "Each participant may submit one painting. All styles and mediums are accepted. The painting must be original and not previously exhibited.",
    schedule: [
      { label: "Registration Opens", date: "May 10, 2024", kind: "open" },
      { label: "Submission Deadline", date: "July 20, 2024", kind: "deadline" },
      { label: "Jury Review", date: "July 22 – July 30, 2024", kind: "review" },
      { label: "Award Ceremony", date: "August 2, 2024", kind: "award" },
    ],
    tags: ["painting", "summer", "gallery", "traditional"],
  },
  "2": {
    title: "Winter Art Challenge",
    image:
      "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=1600&q=80",
    date: "December 10, 2024",
    status: "Upcoming",
    organizer: "ArtChain Foundation",
    location: "Online Event",
    prize: "$1,000 + Feature in Magazine",
    participants: 85,
    description:
      "Submit your winter-themed masterpieces and win prizes. Open to all ages. Deadline: December 10, 2024.",
    rules:
      "Artwork must be original and themed around winter. All mediums accepted. One entry per participant.",
    schedule: [
      { label: "Registration Opens", date: "Oct 15, 2024", kind: "open" },
      { label: "Submission Deadline", date: "Dec 10, 2024", kind: "deadline" },
      { label: "Jury Review", date: "Dec 12 – Dec 18, 2024", kind: "review" },
      { label: "Award Ceremony", date: "Dec 20, 2024", kind: "award" },
    ],
    tags: ["winter", "digital", "online"],
  },
  "3": {
    title: "Abstract Art Competition",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80",
    date: "August 5, 2024",
    status: "Closed",
    organizer: "ArtChain Foundation",
    location: "ArtChain Gallery, New York",
    prize: "$1,500 + Art Supplies",
    participants: 102,
    description:
      "Explore the world of abstract art. Winners announced soon. Thank you for your submissions!",
    rules:
      "Open to all styles of abstract art. One entry per participant. Deadline has passed.",
    schedule: [
      { label: "Submission Deadline", date: "Aug 5, 2024", kind: "deadline" },
      { label: "Results", date: "Aug 12, 2024", kind: "award" },
    ],
    tags: ["abstract", "modern", "conceptual"],
  },
} satisfies Record<string, Contest>;

/** --------- Utils ---------- */
function alpha(hex: string, a = "22") {
  return hex?.length === 7 ? hex + a : hex;
}
function statusToken(C: any, status?: Contest["status"]) {
  switch (status) {
    case "Active":
      return {
        fg: C.primary,
        bg: alpha(C.primary, "1F"),
        ring: alpha(C.primary, "55"),
      };
    case "Upcoming":
      return {
        fg: C.chart1,
        bg: alpha(C.chart1, "1F"),
        ring: alpha(C.chart1, "55"),
      };
    case "Closed":
      return {
        fg: C.mutedForeground,
        bg: alpha(C.mutedForeground, "1A"),
        ring: alpha(C.mutedForeground, "40"),
      };
    default:
      return {
        fg: C.mutedForeground,
        bg: alpha(C.mutedForeground, "1A"),
        ring: alpha(C.mutedForeground, "40"),
      };
  }
}

/** --------- Screen ---------- */
export default function ContestDetail() {
  const { id } = useLocalSearchParams();
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const s = styles(C);

  const contest = useMemo(() => {
    const key = ((id as string) ?? "1") as keyof typeof contestData;
    return contestData[key] ?? contestData["1"];
  }, [id]);

  const st = statusToken(C, contest.status);

  // Parallax + press-in scale for hero
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -20],
    extrapolate: "clamp",
  });
  const heroScale = scrollY.interpolate({
    inputRange: [-100, 0, 200],
    outputRange: [1.06, 1, 1],
    extrapolate: "clamp",
  });
  const pressScale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(pressScale, {
      toValue: 1.03,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  const onPressOut = () =>
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start();

  return (
    <View style={{ flex: 1, backgroundColor: C.background,  }}>
      <DetailHeader
        scheme={scheme}
        title={contest.title}
        onBack={() => router.back()}
      />

      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 25, paddingTop:90 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={
          Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
          }) as unknown as (e: any) => void
        }
      >
        {/* HERO */}
        <View style={s.hero}>
          <Pressable
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            android_ripple={{ color: "#00000022" }}
          >
            <Animated.View
              style={{
                transform: [
                  { translateY: heroTranslateY },
                  { scale: heroScale },
                  { scale: pressScale },
                ],
              }}
            >
              <LinearGradient
                colors={[
                  "#ff6b6b",
                  "#f7d794",
                  "#1dd1a1",
                  "#54a0ff",
                  "#5f27cd",
                  "#ff6b6b",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.gradientBorder}
              >
                {/* Nếu CHỈ muốn viền ở cạnh trên, giữ bottomMask; còn muốn viền cả 4 cạnh thì xóa View này */}

                <View style={s.imageWrapper}>
                  <Animated.Image
                    source={{ uri: contest.image }}
                    style={s.image}
                  />
              
                  <View style={s.innerStroke} pointerEvents="none" />
                </View>
              </LinearGradient>
            </Animated.View>
          </Pressable>

          <View
            style={[
              s.statusBadge,
              { backgroundColor: st.bg, borderColor: st.ring },
            ]}
          >
            <Palette size={14} color={st.fg} strokeWidth={2.4} />
            <Text style={[s.statusText, { color: st.fg }]}>
              {contest.status}
            </Text>
          </View>
        </View>

        {/* CONTENT */}
        <View style={s.content}>
          {/* Row: Date + Participants */}
          <AnimatedSection delay={60}>
            <View style={s.row2}>
              <View style={s.itemCol}>
                <MetaItem
                  kind="date"
                  value={contest.date}
                  scheme={scheme}
                  tint={VIVID.blue}
                  iconStroke={2.4}
                />
              </View>
              <View style={[s.itemCol, { marginRight: 0 }]}>
                <MetaItem
                  kind="participants"
                  value={contest.participants}
                  scheme={scheme}
                  tint={VIVID.sky}
                  iconStroke={2.4}
                />
              </View>
            </View>
          </AnimatedSection>

          {/* Organizer / Location / Prize */}
          <AnimatedSection delay={120}>
            <MetaItem
              kind="organizer"
              value={contest.organizer}
              scheme={scheme}
              tint={VIVID.green}
              iconStroke={2.4}
            />
            <MetaItem
              kind="location"
              value={contest.location}
              scheme={scheme}
              tint={VIVID.red}
              iconStroke={2.4}
            />
            <MetaItem
              kind="prize"
              value={contest.prize}
              scheme={scheme}
              tint={VIVID.amber}
              iconStroke={2.4}
            />
          </AnimatedSection>

          {/* Tags */}
          {contest.tags.length > 0 && (
            <AnimatedSection delay={180}>
              <View style={[s.block, sectionShadow.base]}>
                <Text style={s.blockTitle}>Categories / Tags</Text>
                <View style={s.tagsRow}>
                  {contest.tags.map((t) => (
                    <View key={t} style={[s.tag, { borderColor: C.border }]}>
                      <Text style={s.tagText}>#{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </AnimatedSection>
          )}

          {/* Timeline */}
          {contest.schedule.length > 0 && (
            <AnimatedSection delay={240}>
              <View style={[s.block, sectionShadow.base]}>
                <Text style={s.blockTitle}>Timeline</Text>
                {contest.schedule.map((it, idx) => (
                  <ScheduleItem
                    key={`${it.label}-${idx}`}
                    scheme={scheme}
                    label={it.label}
                    date={it.date}
                    kind={it.kind as ScheduleKind}
                  />
                ))}
              </View>
            </AnimatedSection>
          )}

          {/* About */}
          <AnimatedSection delay={300}>
            <View style={[s.block, sectionShadow.base]}>
              <Text style={s.blockTitle}>About the contest</Text>
              <Text style={s.desc}>{contest.description}</Text>
            </View>
          </AnimatedSection>

          {/* CTA + Rewards */}
          <AnimatedSection delay={360}>
            {contest.status === "Active" && (
              <TouchableOpacity
                style={[s.ctaBtn, { backgroundColor: C.chart1 }]}
                onPress={() => {}}
                activeOpacity={0.9}
              >
                <Palette size={18} color={C.primaryForeground} />
                <Text style={s.ctaText}>Participate in Contest</Text>
              </TouchableOpacity>
            )}

            {["Active", "Closed"].includes(contest.status) && (
              <View style={[s.rewardsBox, sectionShadow.base]}>
                <Text style={s.rewardsTitle}>Award-Winning Paintings</Text>
                <TouchableOpacity
                  style={[s.rewardsBtn, { backgroundColor: C.accent }]}
                  onPress={() => router.push("/reward-painting")}
                  activeOpacity={0.9}
                >
                  <Text style={s.rewardsBtnText}>See Rewards</Text>
                </TouchableOpacity>
              </View>
            )}
          </AnimatedSection>

          {/* Rules */}
          <AnimatedSection delay={420}>
            <View style={[s.block, sectionShadow.base]}>
              <Text style={s.blockTitle}>Rules</Text>
              <Text style={s.rules}>{contest.rules}</Text>
            </View>
          </AnimatedSection>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/** ---------------- Styles ---------------- */
type StyleMap = {
  hero: ViewStyle;
  gradientBorder: ViewStyle;
  imageWrapper: ViewStyle;
  image: ImageStyle;
  overlay: ViewStyle;
  innerStroke: ViewStyle;
  statusBadge: ViewStyle;
  statusText: TextStyle;
  content: ViewStyle;
  row2: ViewStyle;
  itemCol: ViewStyle;
  block: ViewStyle;
  blockTitle: TextStyle;
  desc: TextStyle;
  tagsRow: ViewStyle;
  tag: ViewStyle;
  tagText: TextStyle;
  ctaBtn: ViewStyle;
  ctaText: TextStyle;
  rewardsBox: ViewStyle;
  rewardsTitle: TextStyle;
  rewardsBtn: ViewStyle;
  rewardsBtnText: TextStyle;
  rules: TextStyle;
};

const styles = (C: any) =>
  StyleSheet.create<StyleMap>({
    // HERO
    hero: {
      height: 260,
      // LƯU Ý: KHÔNG set overflow: "hidden" ở đây để khỏi cắt viền gradient
      borderRadius: 16,
      marginBottom: SPACE.section,
      backgroundColor: C.card,
    },
    gradientBorder: {
      // Viền lộ rõ ở 2 góc trên
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      padding: 2.5, // độ dày viền
      // Để gradient không bị cắt: KHÔNG đặt overflow ở đây

      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },

    imageWrapper: {
      // Bo 2 góc trên cho ảnh để tiệp viền
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderBottomLeftRadius: 14,
      borderBottomRightRadius: 14,
      overflow: "hidden", // CHỈ clip phần ảnh bên trong
      backgroundColor: C.card,
    },
    image: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
      backfaceVisibility: "hidden",
      // NOTE: translateZ is not a valid RN transform; removed to satisfy TS
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.18)",
    },
    innerStroke: {
      ...StyleSheet.absoluteFillObject,
      borderWidth: 2,
      borderRadius: 16,
      borderColor: "rgba(255,255,255,0.35)",
      borderStyle: "dashed",
    },
    statusBadge: {
      position: "absolute",
      left: 12,
      top: 12,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderWidth: StyleSheet.hairlineWidth,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    statusText: { fontWeight: "900", fontSize: 12 },

    // CONTENT
    content: { paddingHorizontal: SPACE.screen, paddingTop: 8 },

    // Hàng 2 cột
    row2: {
      flexDirection: "row",
      marginBottom: SPACE.section,
    },
    itemCol: {
      flex: 1,
      minWidth: 0,
      marginRight: SPACE.between,
    },

    // Blocks
    block: {
      backgroundColor: C.card,
      borderRadius: 14,
      padding: SPACE.section,
      marginTop: SPACE.section,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    blockTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: C.cardForeground,
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    desc: { fontSize: 15, lineHeight: 22, color: C.foreground, opacity: 0.95 },

    // tags
    tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
    tag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: C.input,
      borderWidth: StyleSheet.hairlineWidth,
    },
    tagText: {
      color: C.mutedForeground,
      fontWeight: "800",
      letterSpacing: 0.3,
      fontSize: 12.5,
    },

    // CTA + rewards
    ctaBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginTop: SPACE.section,
      alignSelf: "flex-start",
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    ctaText: {
      color: C.primaryForeground,
      fontWeight: "900",
      letterSpacing: 0.3,
      fontSize: 15,
    },

    rewardsBox: {
      marginTop: SPACE.section,
      padding: SPACE.section,
      borderRadius: 14,
      backgroundColor: C.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    rewardsTitle: {
      fontWeight: "900",
      color: C.cardForeground,
      letterSpacing: 0.3,
    },
    rewardsBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
    rewardsBtnText: {
      color: C.primaryForeground,
      fontWeight: "900",
      letterSpacing: 0.3,
    },

    rules: { fontSize: 14.5, lineHeight: 22, color: C.mutedForeground },
  });
