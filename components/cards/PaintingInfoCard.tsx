// components/cards/PaintingInfoCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

/** ===== Brand palette (từ swatch bạn gửi) ===== */
const BRAND = {
  primary: "#E24D48", // đỏ chính
  primaryDark: "#B53A36",
  primaryLight: "#F07C77",
  success: "#22C55E",
  surface: "rgba(0,0,0,0.04)",
};

export type Tokens = {
  card: string;
  foreground: string;
  mutedForeground: string;
  border: string;
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
  const base = hex || BRAND.primary;
  try {
    const h = base.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const lighten = (v: number, amt = 18) => Math.min(255, v + amt);
    const darken = (v: number, amt = 22) => Math.max(0, v - amt);
    return [
      `rgb(${lighten(r)},${lighten(g)},${lighten(b)})`,
      `rgb(${darken(r)},${darken(g)},${darken(b)})`,
    ];
  } catch {
    return [BRAND.primary, BRAND.primaryDark];
  }
}

/* ============ Pressable scale ============ */
const PressableScale: React.FC<
  React.PropsWithChildren<{
    onPress?: () => void;
    style?: any;
    disabled?: boolean;
  }>
> = ({ children, onPress, style, disabled }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      friction: 6,
      tension: 170,
    }).start();
  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => !disabled && animate(0.97)}
      onPressOut={() => animate(1)}
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
  submissionDate?: string | number | Date;
  onPress?: () => void;
  accentHex?: string;
  /** Optional: hiển thị trạng thái đã/không đạt ngay trên card */
  status?: "PASSED" | "FAILED" | undefined;
};

const PaintingInfoCard: React.FC<Props> = ({
  C,
  scheme,
  title,
  artistName,
  paintingId,
  imageUrl,
  submissionDate,
  onPress,
  accentHex,
  status,
}) => {
  const [g0, g1] = gradientFromAccent(accentHex);
  const s = styles(C);

  const statusChip =
    status === "FAILED" ? (
      <View style={[s.statusChip, { backgroundColor: BRAND.primary }]}>
        <Ionicons name="close" size={12} color="#fff" />
        <Text style={s.statusChipText}>KHÔNG ĐẠT</Text>
      </View>
    ) : status === "PASSED" ? (
      <View style={[s.statusChip, { backgroundColor: BRAND.success }]}>
        <Ionicons name="checkmark" size={12} color="#fff" />
        <Text style={s.statusChipText}>ĐẠT</Text>
      </View>
    ) : null;

  return (
    <LinearGradient
      colors={[g0, g1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={s.wrap}
    >
      <View style={s.border}>
        <BlurView
          intensity={26}
          tint={scheme === "dark" ? "dark" : "light"}
          style={s.card}
        >
          {/* MEDIA */}
          <View style={s.media}>
            <Image
              source={{ uri: imageUrl }}
              style={s.image}
              placeholder={require("@/assets/images/partial-react-logo.png")}
              contentFit="cover"
              transition={160}
            />

            {/* overlay gradient */}
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.6)"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={s.shade}
            />

            {/* date + status */}
            <View style={s.topRightStack}>
              {submissionDate ? (
                <View style={s.dateChip}>
                  <Ionicons name="calendar-outline" size={12} color="#111827" />
                  <Text style={s.dateText}>
                    {new Date(submissionDate).toLocaleDateString()}
                  </Text>
                </View>
              ) : null}
              {statusChip}
            </View>

            {/* Title pill */}
            <View style={s.titlePill}>
              <BlurView intensity={22} tint="dark" style={s.titlePillBlur} />
              <Text numberOfLines={2} style={s.title}>
                {title}
              </Text>
            </View>
          </View>

          {/* META + CTA */}
          <View style={s.content}>
            <View style={s.metaRow}>
              {/* Avatar mono */}
              <View style={[s.avatar, { backgroundColor: g1 }]}>
                <Text style={s.avatarTxt}>
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

              {/* ART badge rõ nét */}
              <View style={s.artBadge}>
                <Ionicons name="color-palette" size={12} color="#0B1220" />
                <Text style={s.artBadgeText}>ART</Text>
              </View>
            </View>

            <View style={s.divider} />

            <PressableScale onPress={onPress} style={s.cta}>
              <LinearGradient
                colors={[g0, g1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.ctaInner}
              >
                <Ionicons name="create-outline" size={16} color="#ffffff" />
                <Text style={s.ctaText}>Chấm bài</Text>
                <Ionicons name="arrow-forward" size={16} color="#ffffff" />
              </LinearGradient>
            </PressableScale>
          </View>
        </BlurView>
      </View>
    </LinearGradient>
  );
};

export default PaintingInfoCard;

const styles = (C: Tokens) =>
  StyleSheet.create({
    wrap: { borderRadius: 16, padding: 1.5, marginBottom: 14, elevation: 4 },
    border: {
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: toAlpha(C.card, 0.6),
    },
    card: { overflow: "hidden", borderRadius: 14 },

    media: {
      position: "relative",
      width: "100%",
      aspectRatio: 4 / 3,
      backgroundColor: toAlpha("#000", 0.08),
    },
    image: { width: "100%", height: "100%" },
    shade: { ...StyleSheet.absoluteFillObject },

    topRightStack: {
      position: "absolute",
      top: 10,
      right: 10,
      gap: 6,
      alignItems: "flex-end",
    },
    dateChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "#fff",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: toAlpha(C.border, 0.6),
    },
    dateText: { fontSize: 12, fontWeight: "800", color: "#111827" },

    statusChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    statusChipText: { fontSize: 12, fontWeight: "900", color: "#fff" },

    titlePill: {
      position: "absolute",
      left: 10,
      right: 10,
      bottom: 10,
      borderRadius: 10,
      overflow: "hidden",
    },
    titlePillBlur: { ...StyleSheet.absoluteFillObject, borderRadius: 10 },
    title: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "900",
      letterSpacing: 0.2,
      paddingHorizontal: 10,
      paddingVertical: 6,
      textShadowColor: "rgba(0,0,0,0.25)",
      textShadowRadius: 4,
      textShadowOffset: { width: 0, height: 1 },
    },

    content: {
      backgroundColor: toAlpha("#ffffff", 0.86),
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 12,
    },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 10 },

    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarTxt: { color: "#fff", fontWeight: "900", fontSize: 12 },

    artist: { fontSize: 14, fontWeight: "900", color: C.foreground },
    subtle: { fontSize: 12, color: C.mutedForeground },

    artBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "#FFD966", // nền vàng để tương phản, chữ đậm
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: toAlpha("#0B1220", 0.08),
    },
    artBadgeText: {
      fontSize: 12,
      fontWeight: "900",
      color: "#0B1220",
      letterSpacing: 0.3,
    },

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: toAlpha(C.border, 0.9),
      marginTop: 10,
      marginBottom: 10,
    },

    cta: { borderRadius: 10, overflow: "hidden" },
    ctaInner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
    },
    ctaText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "900",
      letterSpacing: 0.3,
    },
  });
