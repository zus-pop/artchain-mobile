import type { ColorTokens } from "@/types/tabkey";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  C: ColorTokens;
  icon?: keyof typeof Ionicons.glyphMap;
  text: string;
  ctaLabel?: string;
  onPressCta?: () => void;
  compact?: boolean; // dùng cho danh sách nhỏ, padding ít hơn
};

export default function EmptyTab({
  C,
  icon = "information-circle-outline",
  text,
  ctaLabel,
  onPressCta,
  compact,
}: Props) {
  return (
    <View style={[styles.wrap, compact && { paddingVertical: 28 }]}>
      <Ionicons name={icon} size={64} color={C.muted} />
      <Text style={[styles.text, { color: C.mutedForeground }]}>{text}</Text>

      {!!ctaLabel && (
        <TouchableOpacity
          onPress={onPressCta}
          style={[styles.btn, { backgroundColor: C.primary }]}
          activeOpacity={0.9}
        >
          <Text style={[styles.btnText, { color: C.primaryForeground }]}>
            {ctaLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 14,
    marginBottom: 22,
    lineHeight: 22,
  },
  btn: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  btnText: { fontSize: 14, fontWeight: "700" },
});
