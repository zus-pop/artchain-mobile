// components/cards/guardian/ChildrentCard.tsx
import { withOpacity } from "@/constants/theme";
import type { ColorTokens } from "@/types/tabkey";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

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

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: C.card,
          borderColor: C.border,
          shadowColor: "#000",
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        {/* Subtle avatar with thin ring */}
        <View style={styles.avatarWrap}>
          <View
            style={[
              styles.avatarRing,
              { borderColor: withOpacity(C.primary, 0.25) },
            ]}
          >
            <View
              style={[
                styles.avatarCore,
                {
                  backgroundColor: avatarBg || withOpacity(C.primary, 0.12),
                },
              ]}
            >
              <Ionicons name="person-outline" size={20} color="#fff" />
            </View>
          </View>
        </View>

        {/* Name + meta */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={[styles.name, { color: C.foreground }]}
            numberOfLines={1}
          >
            {displayName}
          </Text>

          <View style={styles.metaRow}>
            <MetaItem
              C={C}
              icon="school-outline"
              text={`Lớp ${displayGrade}`}
            />
            <Dot C={C} />
            <MetaItem C={C} icon="business-outline" text={displaySchool} />
          </View>
        </View>
      </View>

      {/* Divider */}



    </View>
  );
};

function MetaItem({
  C,
  icon,
  text,
}: {
  C: ColorTokens;
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={13} color={withOpacity(C.foreground, 0.7)} />
      <Text
        style={[styles.metaText, { color: withOpacity(C.foreground, 0.7) }]}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
}

function Dot({ C }: { C: ColorTokens }) {
  return (
    <View
      style={[styles.dot, { backgroundColor: withOpacity(C.foreground, 0.2) }]}
    />
  );
}

function Stat({
  C,
  icon,
  label,
  value,
  tint,
}: {
  C: ColorTokens;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  tint: string;
}) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIconWrap, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={16} color={C.primary} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={[styles.statValue, { color: C.foreground }]}
          numberOfLines={1}
        >
          {value}
        </Text>
        <Text
          style={[styles.statLabel, { color: withOpacity(C.foreground, 0.6) }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: StyleSheet.hairlineWidth, // ✅ chỉ hairline, giảm cảm giác “nặng”
    shadowOpacity: 0.06, // ✅ bóng nhẹ
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },

  header: { flexDirection: "row", alignItems: "center" },

  avatarWrap: { marginRight: 12 },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1, // ✅ vòng mảnh
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCore: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "800",
    includeFontPadding: false,
  },

  metaRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
  },
  metaText: {
    fontSize: 12.5,
    includeFontPadding: false,
    maxWidth: 200,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
  },

  hr: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
    borderRadius: 1,
  },

  statsRow: { flexDirection: "row", gap: 10 },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10, // ✅ bo nhẹ vừa phải
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 18,
  },
  statLabel: {
    fontSize: 12,
    includeFontPadding: false,
    lineHeight: 15,
    marginTop: 2,
  },
});

export default ChildCard;
