// components/AuthInput.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  label: string;
  value?: string;
  onChangeText?: (t: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
  leftIcon?: React.ComponentProps<typeof Ionicons>["name"];
  rightIcon?: React.ComponentProps<typeof Ionicons>["name"];
  secureTextEntry?: boolean;
  onPressRightIcon?: () => void;
  errorText?: string;
};

export default function AuthInput({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  autoCapitalize = "none",
  keyboardType = "default",
  leftIcon,
  rightIcon,
  secureTextEntry,
  onPressRightIcon,
  errorText,
}: Props) {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const INPUT_H = 56;
  const ICON = 20;
  const PADX = 12;
  const GAP = 8;
  const labelLeft = leftIcon ? PADX + ICON + GAP : PADX;

  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const labelY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [INPUT_H / 2 - 29,-17],
  });
  const labelSize = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 12],
  });

  const borderColor = errorText ? C.destructive : value ? C.primary : C.border;
  const borderWidth = value || errorText ? 2 : 1;
  const labelColor = errorText
    ? C.destructive
    : value
    ? C.primary
    : C.mutedForeground;

  return (
    <View style={{ width: "100%", marginBottom: 14 }}>
      <View
        style={{
          backgroundColor: C.input,
          borderRadius: 12,
          minHeight: INPUT_H,
          justifyContent: "center",
          borderColor,
          borderWidth,
          shadowColor: errorText ? C.destructive : C.primary,
          shadowOpacity: value ? 0.2 : 0,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          ...(Platform.OS === "android" ? { elevation: value ? 1 : 0 } : null),
        }}
      >
        <Animated.Text
          numberOfLines={1}
          style={{
            position: "absolute",
            left: labelLeft,
            paddingHorizontal: 6,
            borderRadius: 8,
            backgroundColor: C.input,
            transform: [{ translateY: labelY as any }],
            fontSize: labelSize as any,
            color: labelColor,
          }}
        >
          {label}
        </Animated.Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: INPUT_H,
            paddingHorizontal: PADX,
          }}
        >
          {leftIcon ? (
            <Ionicons
              name={leftIcon}
              size={ICON}
              color={
                errorText
                  ? C.destructive
                  : value
                  ? C.primary
                  : C.mutedForeground
              }
              style={{ width: ICON, marginRight: GAP, textAlign: "center" }}
            />
          ) : null}

          <TextInput
            value={value}
            onChangeText={onChangeText}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor={C.mutedForeground}
            secureTextEntry={secureTextEntry}
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            style={{ flex: 1, fontSize: 16, color: C.foreground, padding: 0 }}
          />

          {rightIcon ? (
            <TouchableOpacity
              onPress={onPressRightIcon}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={rightIcon}
                size={18}
                color={errorText ? C.destructive : C.mutedForeground}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {errorText ? (
        <Text
          style={{
            color: C.destructive,
            fontSize: 13,
            marginTop: 6,
            marginLeft: 4,
          }}
        >
          {errorText}
        </Text>
      ) : null}
    </View>
  );
}
