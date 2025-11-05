// components/LoginField.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Control, Controller } from "react-hook-form";
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
  control: Control<any>;
  name: string;
  placeholder: string; // dùng làm floating label
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  isPassword?: boolean;
};

export default function LoginField({
  control,
  name,
  placeholder,
  icon,
  isPassword,
}: Props) {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const [show, setShow] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current; // 0: placeholder-center, 1: floated

  const animateTo = (to: number) => {
    Animated.timing(focusAnim, {
      toValue: to,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  };

  // --- Layout constants (để label không dính icon & căn giữa)
  const INPUT_HEIGHT = 56;
  const ICON_SIZE = 20;
  const H_PADDING = 12;
  const GAP = 8;
  const labelLeft = icon ? H_PADDING + ICON_SIZE + GAP : H_PADDING;

  // Interpolations
  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.border, C.primary],
  });
  const borderWidth = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });
  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.2],
  });


const labelY = focusAnim.interpolate({
  inputRange: [0, 1],

  outputRange: [INPUT_HEIGHT / 2 - 29, -27],
});

const labelSize = focusAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [15, 12], // trước là [16, 12]
});

  const labelColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.mutedForeground, C.primary],
  });

  const S = useMemo(
    () => ({
      wrap: { width: "100%", marginBottom: 14 } as const,
      box: {
        backgroundColor: C.input,
        borderRadius: 12, // vuông hơn xíu
        minHeight: INPUT_HEIGHT,
        justifyContent: "center",
        borderWidth: 1,
      } as const,
      row: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        paddingHorizontal: H_PADDING,
      },
      input: {
        flex: 1,
        // Không cần paddingTop lớn vì dùng floating label riêng
        paddingVertical: 12,
        fontSize: 16,
        color: C.foreground,
      },
      leftIcon: {
        marginRight: GAP,
        width: ICON_SIZE,
        textAlign: "center",
      } as const,
      rightBtn: { paddingVertical: 10, paddingLeft: 8, marginLeft: 4 } as const,
      labelChip: {
        position: "absolute" as const,
        left: labelLeft,
        paddingHorizontal: 6,
        borderRadius: 8,
        backgroundColor: C.input, // tạo “mảng” cắt qua viền khi nổi
        alignSelf: "flex-start" as const,
      },
      errorText: {
        color: C.destructive,
        fontSize: 13,
        marginTop: 6,
        marginLeft: 4,
      },
    }),
    [scheme]
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasValue = !!field.value?.length;

        // sync label state khi mount / value đổi
        useEffect(() => {
          animateTo(hasValue ? 1 : 0);
        }, [hasValue]);

        return (
          <View style={S.wrap}>
            {/* Hộp input với viền/đổ bóng animate */}
            <Animated.View
              style={[
                S.box,
                {
                  borderColor: fieldState.error
                    ? C.destructive
                    : (borderColor as any),
                  borderWidth: fieldState.error ? 2 : (borderWidth as any),
                  shadowColor: fieldState.error ? C.destructive : C.primary,
                  shadowOpacity: fieldState.error
                    ? 0.18
                    : (shadowOpacity as any),
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 6 },
                  ...(Platform.OS === "android"
                    ? { elevation: fieldState.error ? 2 : 1 }
                    : null),
                },
              ]}
            >
              {/* Floating label — nằm giữa khi idle, bay lên khi focus/hasValue */}
              <Animated.Text
                style={[
                  S.labelChip,
                  {
                    transform: [{ translateY: labelY as any }],
                    fontSize: labelSize as any,
                    color: fieldState.error
                      ? C.destructive
                      : (labelColor as any),
                  },
                ]}
                numberOfLines={1}
              >
                {placeholder}
              </Animated.Text>

              <View style={S.row}>
                {icon ? (
                  <Ionicons
                    name={icon}
                    size={ICON_SIZE}
                    color={
                      fieldState.error
                        ? C.destructive
                        : hasValue
                        ? C.primary
                        : C.mutedForeground
                    }
                    style={S.leftIcon}
                  />
                ) : null}

                <TextInput
                  {...field}
                  placeholder={""} // tránh trùng label
                  value={field.value}
                  onChangeText={field.onChange}
                  onFocus={() => animateTo(1)}
                  onBlur={() => {
                    animateTo(field.value ? 1 : 0);
                    field.onBlur();
                  }}
                  secureTextEntry={isPassword && !show}
                  autoCapitalize="none"
                  style={S.input}
                  selectionColor={C.primary}
                />

                {isPassword ? (
                  <TouchableOpacity
                    onPress={() => setShow((s) => !s)}
                    style={S.rightBtn}
                    accessibilityRole="button"
                    accessibilityLabel={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <Ionicons
                      name={show ? "eye" : "eye-off"}
                      size={20}
                      color={
                        fieldState.error ? C.destructive : C.mutedForeground
                      }
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            </Animated.View>

            {fieldState.error ? (
              <Text style={S.errorText}>{fieldState.error.message}</Text>
            ) : null}
          </View>
        );
      }}
    />
  );
}
