// components/form/FormPickerField.tsx
import type { ColorTokens } from "@/types/tabkey";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  C: ColorTokens;
  label: string;
  value?: string;
  placeholder?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  helperText?: string;
  onPress: () => void;
};

export default function FormPickerField({
  C,
  label,
  value,
  placeholder = "Chọn…",
  leftIcon,
  error,
  helperText,
  onPress,
}: Props) {
  const [pressed, setPressed] = useState(false);
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(ring, {
      toValue: pressed ? 1 : 0,
      duration: 140,
      useNativeDriver: false,
    }).start();
  }, [pressed]);

  const borderCol = ring.interpolate({
    inputRange: [0, 1],
    outputRange: [C.border, C.primary],
  });

  return (
    <View style={sp.wrap}>
      <Animated.View
        style={[
          sp.field,
          {
            backgroundColor: C.card,
            borderColor: error ? C.destructive : (borderCol as any),
            shadowColor: pressed ? C.primary : "#000",
          },
        ]}
      >
        {leftIcon ? (
          <View style={sp.iconWrap}>
            <Ionicons
              name={leftIcon}
              size={18}
              color={error ? C.destructive : C.mutedForeground}
            />
          </View>
        ) : null}

        <Pressable
          onPress={onPress}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          style={sp.press}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={[
                sp.label,
                { color: error ? C.destructive : C.mutedForeground },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
            <Text
              style={[
                sp.value,
                {
                  color: value ? C.foreground : C.muted,
                },
              ]}
              numberOfLines={1}
            >
              {value || placeholder}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={C.mutedForeground} />
        </Pressable>
      </Animated.View>

      {error ? (
        <Text style={[sp.errTxt, { color: C.destructive }]}>{error}</Text>
      ) : helperText ? (
        <Text style={[sp.helper, { color: C.mutedForeground }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const sp = StyleSheet.create({
  wrap: { marginBottom: 14 },
  field: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  iconWrap: { paddingRight: 8 },
  press: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  value: { fontSize: 15, fontWeight: "700", letterSpacing: 0.2 },
  errTxt: { marginTop: 6, fontSize: 12, fontWeight: "600" },
  helper: { marginTop: 6, fontSize: 12 },
});
