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
          <View style={[{ borderColor: withOpacity(C.primary, 0.25) }]}>
            <View
              style={[
                styles.avatarCore,
                {
                  backgroundColor: avatarBg || withOpacity(C.primary, 0.12),
                },
              ]}
            >
              <Ionicons name="person-outline" size={18} color="#fff" />
            </View>
          </View>
        </View>

        {/* Name + meta */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={[styles.name, { color: C.foreground }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayName}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons
                name="school-outline"
                size={12}
                color={withOpacity(C.foreground, 0.7)}
              />
              <Text
                style={[
                  styles.metaText,
                  { color: withOpacity(C.foreground, 0.7) },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {`Lớp ${displayGrade}`}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons
                name="business-outline"
                size={12}
                color={withOpacity(C.foreground, 0.7)}
              />
              <Text
                style={[
                  styles.metaText,
                  { color: withOpacity(C.foreground, 0.7) },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {displaySchool}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Divider */}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    width: "100%",
  },

  header: { flexDirection: "row", alignItems: "center" },

  avatarWrap: { marginRight: 10 },
  avatarCore: {
    width: 30,
    height: 30,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    fontSize: 13,
    fontWeight: "700",
    includeFontPadding: false,
    lineHeight: 16,
    marginBottom: 2,
  },

  metaRow: {
    marginTop: 6,
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
  },
  metaText: {
    fontSize: 11,
    includeFontPadding: false,
    flex: 1,
  },
});

export default ChildCard;
