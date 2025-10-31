// components/cards/PaintingVipCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

export type Tokens = {
  card: string;
  foreground: string;
  mutedForeground: string;
  border: string;
};

type Status = "passed" | "failed" | "pending";

const STATUS: Record<
  Status,
  {
    bg: string;
    fg: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }
> = {
  passed: {
    bg: "#10B981",
    fg: "#FFFFFF",
    icon: "checkmark-circle",
    label: "Đạt",
  },
  pending: { bg: "#F59E0B", fg: "#111827", icon: "time", label: "Chờ duyệt" },
  failed: {
    bg: "#EF4444",
    fg: "#FFFFFF",
    icon: "close-circle",
    label: "Không đạt",
  },
};

function toAlpha(hex: string, a: number) {
  if (!hex) return `rgba(0,0,0,${a})`;
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
function gradientFromAccent(hex?: string): [string, string] {
  const fb: [string, string] = ["#7C3AED", "#06B6D4"];
  if (!hex) return fb;
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16),
    g = parseInt(h.slice(2, 4), 16),
    b = parseInt(h.slice(4, 6), 16);
  const l = (v: number) => Math.min(255, v + 24),
    d = (v: number) => Math.max(0, v - 28);
  return [`rgb(${l(r)},${l(g)},${l(b)})`, `rgb(${d(r)},${d(g)},${d(b)})`];
}

const PressableScale: React.FC<
  React.PropsWithChildren<{
    onPress?: () => void;
    style?: any;
    disabled?: boolean;
  }>
> = ({ children, onPress, style, disabled }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const anim = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true }).start();
  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => !disabled && anim(0.97)}
      onPressOut={() => anim(1)}
      onPress={onPress}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

type Props = {
  C: Tokens;
  scheme: "light" | "dark";
  title: string;
  artistName: string;
  paintingId: string;
  imageUrl: string;
  submissionDate: string | number | Date;
  onPress?: () => void;
  accentHex?: string;
  status?: Status; // <-- dùng để hiển thị ribbon
};

const PaintingVipCard: React.FC<Props> = ({
  C,
  scheme,
  title,
  artistName,
  paintingId,
  imageUrl,
  submissionDate,
  onPress,
  accentHex = "#7C3AED",
  status = "pending",
}) => {
  const [g0, g1] = gradientFromAccent(accentHex);
  const s = styles(C);
  const st = STATUS[status];

  return (
    <LinearGradient
      colors={[g0, g1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={s.wrap}
    >
      <PressableScale onPress={onPress} style={s.border}>
        <BlurView
          intensity={18}
          tint={scheme === "dark" ? "dark" : "light"}
          style={s.card}
        >
          {/* MEDIA */}
          <View style={s.media}>
            <Image
              source={{ uri: imageUrl }}
              style={s.img}
              placeholder={require("@/assets/images/partial-react-logo.png")}
              contentFit="cover"
              transition={200}
            />
            {/* overlay đậm để chữ nổi bật */}
            <LinearGradient
              colors={["rgba(0,0,0,0.12)", "rgba(0,0,0,0.85)"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={s.shade}
            />

            {/* RIBBON TRẠNG THÁI (TRÁI) */}
            <View style={[s.status, { backgroundColor: st.bg }]}>
              <Ionicons name={st.icon} size={14} color={st.fg} />
              <Text style={[s.statusText, { color: st.fg }]}>{st.label}</Text>
            </View>

            {/* CHIP NGÀY (PHẢI) */}
            <View style={s.dateChip}>
              <Ionicons name="calendar-outline" size={12} color="#0F172A" />
              <Text style={s.dateTxt}>
                {new Date(submissionDate).toLocaleDateString()}
              </Text>
            </View>

            {/* TITLE TRÊN ẢNH — CÓ NỀN */}
            <View style={s.titleWrap}>
              <View style={s.titlePill}>
                <Text numberOfLines={2} style={s.title}>
                  {title}
                </Text>
              </View>
            </View>
          </View>

          {/* META */}
          <View style={s.content}>
            <View style={s.metaRow}>
              <View style={s.mono}>
                <Text style={s.monoTxt}>
                  {(artistName || "A").slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={s.artist}>
                  {artistName}
                </Text>
                <Text numberOfLines={1} style={s.subtle}>
                  #{paintingId}
                </Text>
              </View>
              {/* BADGE ART — nền đậm, không mờ */}
              <View style={s.tag}>
                <Ionicons name="color-palette" size={12} color="#fff" />
                <Text style={s.tagTxt}>ART</Text>
              </View>
            </View>

            <View style={s.divider} />

            <View style={s.cta}>
              <LinearGradient
                colors={[g0, g1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.ctaInner}
              >
                <Ionicons name="create-outline" size={16} color="#fff" />
                <Text style={s.ctaTxt}>Chấm bài</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </LinearGradient>
            </View>
          </View>
        </BlurView>
      </PressableScale>
    </LinearGradient>
  );
};

export default PaintingVipCard;

/* ==== Styles: bo góc ÍT hơn, badge rõ màu, title có nền ==== */
const styles = (C: Tokens) =>
  StyleSheet.create({
    wrap: {
      borderRadius: 10,
      padding: 1.5,
      marginBottom: 14,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    border: {
      borderRadius: 8,
      overflow: "hidden",
      backgroundColor: toAlpha(C.card, 0.6),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: toAlpha(C.border, 0.6),
    },
    card: { overflow: "hidden", borderRadius: 8 },

    media: {
      position: "relative",
      width: "100%",
      aspectRatio: 4 / 3,
      backgroundColor: toAlpha("#000", 0.08),
    },
    img: { width: "100%", height: "100%" },
    shade: { ...StyleSheet.absoluteFillObject },

    status: {
      position: "absolute",
      top: 10,
      left: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
    },
    statusText: { fontSize: 12, fontWeight: "800" },

    dateChip: {
      position: "absolute",
      top: 10,
      right: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: "#fff",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: toAlpha(C.border, 0.7),
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    dateTxt: { fontSize: 12, fontWeight: "800", color: "#0F172A" },

    titleWrap: { position: "absolute", left: 12, right: 12, bottom: 10 },
    titlePill: {
      backgroundColor: "rgba(17,24,39,0.7)",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,255,255,0.18)",
      alignSelf: "flex-start",
    },
    title: {
      color: "#fff",
      fontSize: 17,
      fontWeight: "900",
      letterSpacing: 0.2,
    },

    content: {
      backgroundColor: toAlpha("#fff", 0.94),
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 12,
    },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 10 },

    mono: {
      width: 26,
      height: 26,
      borderRadius: 6,
      backgroundColor: "#111827",
      alignItems: "center",
      justifyContent: "center",
    },
    monoTxt: { color: "#fff", fontWeight: "800", fontSize: 11 },

    artist: { fontSize: 14, fontWeight: "800", color: C.foreground },
    subtle: { fontSize: 12, color: C.mutedForeground },

    tag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: "#111827",
    },
    tagTxt: {
      fontSize: 12,
      fontWeight: "900",
      color: "#fff",
      letterSpacing: 0.4,
    },

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: toAlpha(C.border, 0.9),
      marginVertical: 10,
    },

    cta: { borderRadius: 8, overflow: "hidden" },
    ctaInner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 11,
    },
    ctaTxt: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "900",
      letterSpacing: 0.3,
    },
  });
