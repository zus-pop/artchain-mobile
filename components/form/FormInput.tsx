import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Control, Controller, FieldError } from "react-hook-form";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  isPassword?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: React.ComponentProps<typeof TextInput>["keyboardType"];
};

export default function FormInput({
  control,
  name,
  label,
  placeholder,
  icon,
  isPassword,
  autoCapitalize = "none",
  keyboardType = "default",
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);

  const C = Colors[colorScheme];
  const ACCENT = C.primary; // cam của app

  const styles = useMemo(
    () =>
      StyleSheet.create({
        label: {
          fontSize: 14,
          color: C.mutedForeground,
          marginBottom: 6,
          marginLeft: 4,
          fontWeight: "500",
        },
        wrapper: {
          borderWidth: 1,
          borderRadius: 14,
          backgroundColor: C.input,
          borderColor: focused ? ACCENT : C.border,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          // Glow nhẹ khi focus
          shadowColor: focused ? ACCENT : "transparent",
          shadowOpacity: focused ? 0.2 : 0,
          shadowRadius: focused ? 8 : 0,
          shadowOffset: { width: 0, height: 2 },
          ...(Platform.OS === "android"
            ? { elevation: focused ? 2 : 0 }
            : null),
        },
        input: {
          flex: 1,
          paddingVertical: 12,
          fontSize: 16,
          color: C.foreground,
        },
        leftIcon: {
          marginRight: 8,
          opacity: 0.9,
        },
        rightIconBtn: {
          paddingVertical: 10,
          paddingLeft: 8,
          marginLeft: 4,
        },
        errorText: {
          color: C.destructive,
          fontSize: 13,
          marginTop: 6,
          marginLeft: 4,
        },
      }),
    [colorScheme, focused]
  );

  const renderRight = (error?: FieldError) => {
    if (isPassword) {
      return (
        <TouchableOpacity
          onPress={() => setShow((s) => !s)}
          style={styles.rightIconBtn}
          accessibilityRole="button"
          accessibilityLabel={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          <Ionicons
            name={show ? "eye" : "eye-off"}
            size={20}
            color={error ? C.destructive : C.mutedForeground}
          />
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View style={{ width: "100%", marginBottom: 14 }}>
          {label ? <Text style={styles.label}>{label}</Text> : null}

          <View
            style={[
              styles.wrapper,
              fieldState.error && { borderColor: C.destructive },
            ]}
          >
            {icon ? (
              <Ionicons
                name={icon}
                size={20}
                color={
                  fieldState.error
                    ? C.destructive
                    : focused
                    ? ACCENT
                    : C.mutedForeground
                }
                style={styles.leftIcon}
              />
            ) : null}

            <TextInput
              {...field}
              placeholder={placeholder}
              placeholderTextColor={C.mutedForeground}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={() => {
                setFocused(false);
                field.onBlur();
              }}
              onFocus={() => setFocused(true)}
              secureTextEntry={isPassword && !show}
              autoCapitalize={autoCapitalize}
              keyboardType={keyboardType}
              style={styles.input}
              selectionColor={ACCENT}
            />

            {renderRight(fieldState.error)}
          </View>

          {fieldState.error ? (
            <Text style={styles.errorText}>{fieldState.error.message}</Text>
          ) : null}
        </View>
      )}
    />
  );
}
