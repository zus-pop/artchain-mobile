import type { ColorTokens } from "@/types/tabkey";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, Text } from "react-native";

type Props = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  colors: ColorTokens;
  variant?: "filled" | "ghost";
  disabled?: boolean;
};

const PillButton: React.FC<Props> = ({
  label,
  icon = "person-circle-outline",
  onPress,
  colors: C,
  variant = "ghost",
  disabled,
}) => {
  const isFilled = variant === "filled";
  const bg = isFilled ? C.primary : C.muted;
  const fg = isFilled ? C.primaryForeground : C.foreground;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{
        color: isFilled ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)",
        borderless: false,
      }}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          opacity: disabled ? 0.6 : pressed && Platform.OS === "ios" ? 0.85 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={16} color={fg} style={{ marginRight: 6 }} />
      <Text style={[styles.txt, { color: fg }]}>{label}</Text>
    </Pressable>
  );
};

export default PillButton;

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    // nhẹ nhàng giống thẻ Grab
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  txt: { fontWeight: "700", fontSize: 13 },
});
