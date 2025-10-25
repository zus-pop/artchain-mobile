// components/cards/competitor/EmptyState.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { ColorTokens } from "@/types/tabkey";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  action?: string;
  onPressAction?: () => void;
  /** Màu theme truyền từ ngoài (optional). Nếu không có sẽ lấy theo scheme hiện tại */
  C?: ColorTokens;
  /** Giảm padding dọc khi hiển thị trong tab để đỡ “thừa” khoảng trống */
  compact?: boolean;
  /** Cho phép thêm style ngoài nếu cần */
  style?: ViewStyle;
};

export default function EmptyState({
  icon,
  title,
  action,
  onPressAction,
  C: CProp,
  compact = false,
  style,
}: EmptyStateProps) {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = CProp ?? Colors[scheme];

  return (
    <View style={[styles.wrap, { paddingVertical: compact ? 36 : 60 }, style]}>
      <Ionicons name={icon} size={64} color={C.muted} />
      <Text style={[styles.title, { color: C.mutedForeground }]}>{title}</Text>
      {!!action && (
        <TouchableOpacity
          onPress={onPressAction}
          style={[styles.btn, { backgroundColor: C.primary }]}
          activeOpacity={0.9}
        >
          <Text style={[styles.btnText, { color: C.primaryForeground }]}>
            {action}
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
  },
  title: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  btn: {
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
