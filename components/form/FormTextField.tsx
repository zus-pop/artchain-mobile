// components/form/FormTextField.tsx
import type { ColorTokens } from "@/types/tabkey";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

type Props = {
  C: ColorTokens;
  label: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  helperText?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  onBlur?: () => void;
} & Omit<TextInputProps, "placeholder" | "onBlur" | "onChangeText" | "value">;

export default function FormTextField({
  C,
  label,
  leftIcon,
  error,
  helperText,
  value,
  onChangeText,
  onBlur,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  const float = useRef(new Animated.Value(value ? 1 : 0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(float, {
      toValue: focused || !!value ? 1 : 0,
      useNativeDriver: false,
      damping: 16,
      stiffness: 180,
      mass: 0.7,
    }).start();
  }, [focused, value]);

  useEffect(() => {
    Animated.timing(ring, {
      toValue: focused ? 1 : 0,
      duration: 160,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const labelTop = float.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 6],
  });
  const labelSize = float.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 11.5],
  });
  const borderCol = ring.interpolate({
    inputRange: [0, 1],
    outputRange: [C.border, C.primary],
  });

  return (
    <View style={s.wrap}>
      <Animated.View
        style={[
          s.field,
          {
            backgroundColor: C.card,
            borderColor: error ? C.destructive : (borderCol as any),
            shadowColor: focused ? C.primary : "#000",
          },
        ]}
      >
        {leftIcon ? (
          <View style={s.iconWrap}>
            <Ionicons
              name={leftIcon}
              size={18}
              color={error ? C.destructive : C.mutedForeground}
            />
          </View>
        ) : null}

        <View style={{ flex: 1, minHeight: 44, justifyContent: "center" }}>
          <Animated.Text
            style={[
              s.floatingLabel,
              {
                color: error
                  ? C.destructive
                  : focused
                  ? C.primary
                  : C.mutedForeground,
                top: labelTop,
                fontSize: labelSize as any,
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </Animated.Text>

          <TextInput
            value={value}
            onChangeText={onChangeText}
            onBlur={() => {
              setFocused(false);
              onBlur?.();
            }}
            onFocus={() => setFocused(true)}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            style={[s.input, { color: C.foreground }]}
            placeholderTextColor={C.muted}
            {...rest}
          />
        </View>
      </Animated.View>

      {error ? (
        <Text style={[s.errTxt, { color: C.destructive }]}>{error}</Text>
      ) : helperText ? (
        <Text style={[s.helper, { color: C.mutedForeground }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
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
  floatingLabel: {
    position: "absolute",
    left: 0,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  input: {
    paddingTop: 14,
    paddingBottom: 2,
    fontSize: 15,
    fontWeight: "600",
  },
  errTxt: { marginTop: 6, fontSize: 12, fontWeight: "600" },
  helper: { marginTop: 6, fontSize: 12 },
});
