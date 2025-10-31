// components/cards/guardian/ChildrentCard.tsx
import { withOpacity } from "@/constants/theme";
import type { ColorTokens } from "@/types/tabkey";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

/* ===== vivid palettes + helpers ===== */
const PALETTES: [string, string, string][] = [
  ["#22D3EE", "#3B82F6", "#A78BFA"],
  ["#F59E0B", "#F97316", "#EF4444"],
  ["#10B981", "#22C55E", "#84CC16"],
  ["#EC4899", "#F472B6", "#A78BFA"],
  ["#06B6D4", "#60A5FA", "#22D3EE"],
  ["#8B5CF6", "#6366F1", "#22D3EE"],
];
const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const pickTriGrad = (seed?: string): [string, string, string] => {
  const i = hashStr(seed || Math.random().toString()) % PALETTES.length;
  return PALETTES[i];
};

type Props = {
  C: ColorTokens;
  avatarBg: string;
  name?: string;
  grade?: string;
  schoolName?: string;
};

const ChildCard = ({ C, avatarBg, name, grade, schoolName }: Props) => {
  const displayName = name || "Tên chưa cập nhật";
  const displayGrade = grade || "Chưa cập nhật";
  const displaySchool = schoolName || "Chưa cập nhật";

  const [g0, g1, g2] = useMemo(
    () => pickTriGrad(`${displayName}-${displaySchool}`),
    [displayName, displaySchool]
  );

  return (
    <View style={[styles.card, { backgroundColor: C.card, shadowColor: g1 }]}>
      <LinearGradient
        colors={[g0 + "26", g1 + "22", g2 + "10"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.neonBar}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <LinearGradient
            colors={[g0, g2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarRingOuter}
          >
            <LinearGradient
              colors={[g1, g0]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.avatarRingInner}
            >
              <View style={[styles.avatarCore, { backgroundColor: avatarBg }]}>
                <Ionicons name="color-palette-outline" size={20} color="#fff" />
              </View>
            </LinearGradient>
          </LinearGradient>
          <LinearGradient
            colors={["#ffffffAA", "#ffffff11", "#ffffff00"]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarShine}
          />
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={[styles.name, { color: C.foreground }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayName}
          </Text>

          <View style={styles.rowWrap}>
            <GlassChip
              C={C}
              icon="school-outline"
              text={`Lớp ${displayGrade}`}
              fg={g0}
            />
            <GlassChip
              C={C}
              icon="business-outline"
              text={displaySchool}
              fg={g1}
            />
          </View>
        </View>

        <LinearGradient
          colors={[g2, g1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ribbon}
        >
          <Ionicons name="sparkles-outline" size={14} color="#fff" />
        </LinearGradient>
      </View>

      <View style={[styles.hr, { backgroundColor: C.border }]} />

      {/* Stats: fix “Thành tích” bị đẩy */}
      <View style={styles.statsRow}>
        <CandyStat
          C={C}
          label="Cuộc thi"
          value="0"
          icon="time-outline"
          grad={[g0, g1]}
        />
        <CandyStat
          C={C}
          label="Thành tích"
          value="0"
          icon="trophy-outline"
          grad={["#F59E0B", "#F97316"]}
        />
        <CandyStat
          C={C}
          label="Tác phẩm"
          value="0"
          icon="brush-outline"
          grad={["#EC4899", "#A78BFA"]}
        />
      </View>
    </View>
  );
};

function GlassChip({
  C,
  icon,
  text,
  fg,
}: {
  C: ColorTokens;
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  fg: string;
}) {
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: withOpacity("#ffffff", 0.07),
          borderColor: fg + "55",
        },
      ]}
    >
      <Ionicons name={icon} size={13} color={fg} />
      <Text
        style={[styles.chipText, { color: fg }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {text}
      </Text>
    </View>
  );
}

function CandyStat({
  C,
  label,
  value,
  icon,
  grad,
}: {
  C: ColorTokens;
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  grad: [string, string];
}) {
  return (
    <View
      style={[styles.statItem, { backgroundColor: withOpacity(C.muted, 0.12) }]}
    >
      <LinearGradient
        colors={grad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statBadge}
      >
        <View style={styles.statBadgeCore}>
          <Ionicons name={icon} size={14} color="#fff" />
        </View>
      </LinearGradient>

      {/* Text block: không wrap, không đẩy nhau */}
      <View style={styles.statTextWrap}>
        <Text
          style={[styles.statValue, { color: C.foreground }]}
          numberOfLines={1}
          ellipsizeMode="clip"
        >
          {value}
        </Text>
        <Text
          style={[styles.statLabel, { color: C.mutedForeground }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    overflow: "hidden",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  neonBar: {
    position: "absolute",
    top: 0,
    left: -16,
    right: -16,
    height: 6,
    opacity: 0.9,
  },
  header: { flexDirection: "row", alignItems: "center" },
  avatarWrap: { marginRight: 12, width: 58, height: 58 },
  avatarRingOuter: {
    position: "absolute",
    inset: 0,
    borderRadius: 30,
    padding: 2,
  },
  avatarRingInner: { flex: 1, borderRadius: 28, padding: 2 },
  avatarCore: {
    flex: 1,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarShine: {
    position: "absolute",
    left: 6,
    top: 4,
    right: 18,
    height: 12,
    borderRadius: 12,
    transform: [{ rotate: "-12deg" }],
  },

  name: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.2,
    marginBottom: 6,
    includeFontPadding: false,
  },
  rowWrap: { flexDirection: "row", gap: 8, flexWrap: "wrap" },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: "100%",
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: "700",
    includeFontPadding: false,
    lineHeight: 16,
    maxWidth: 180,
  },

  ribbon: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  hr: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
    borderRadius: 1,
    opacity: 0.8,
  },

  /* ===== Stats row ===== */
  statsRow: { flexDirection: "row", gap: 10 },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    minWidth: 0, // quan trọng để text có thể co
  },
  statBadge: {
    width: 30,
    height: 30,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statBadgeCore: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff20",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ffffff55",
  },
  statTextWrap: {
    flex: 1,
    minWidth: 0, // ✅ ngăn label bị đẩy/đổ hàng
  },
  statValue: {
    fontSize: 15,
    fontWeight: "900",
    includeFontPadding: false,
    lineHeight: 18,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
    includeFontPadding: false,
    lineHeight: 15,
  },
});

export default ChildCard;
