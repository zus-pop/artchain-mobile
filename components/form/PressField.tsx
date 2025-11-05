// components/PressField.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  label: string;
  value?: string;
  onPress: () => void;
  rightIcon?: React.ComponentProps<typeof Ionicons>["name"];
  leftIcon?: React.ComponentProps<typeof Ionicons>["name"];
  errorText?: string;
};

export default function PressField({
  label,
  value,
  onPress,
  rightIcon = "chevron-down",
  leftIcon,
  errorText,
}: Props) {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const INPUT_H = 56;
  const ICON = 20;
  const PADX = 12;
  const GAP = 8;
  const labelLeft = leftIcon ? PADX + ICON + GAP : PADX;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.border, C.primary],
  });
  const borderWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });
  const shadowOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.2],
  });
  const labelY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [INPUT_H / 2 - 18, -10],
  });
  const labelSize = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 12],
  });
  const labelColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.mutedForeground, C.primary],
  });

  const S = useMemo(
    () => ({
      wrap: { width: "100%", marginBottom: 14 } as const,
      box: {
        backgroundColor: C.input,
        borderRadius: 12,
        minHeight: INPUT_H,
        justifyContent: "center",
        borderWidth: 1,
      } as const,
      row: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        paddingHorizontal: PADX,
        height: INPUT_H,
      },
      leftIcon: { marginRight: GAP, width: ICON, textAlign: "center" } as const,
      val: {
        flex: 1,
        fontSize: 16,
        color: value ? C.foreground : C.mutedForeground,
      } as const,
      rightIconWrap: { marginLeft: 8 } as const,
      labelChip: {
        position: "absolute" as const,
        left: labelLeft,
        paddingHorizontal: 6,
        borderRadius: 8,
        backgroundColor: C.input,
        alignSelf: "flex-start" as const,
      },
      err: {
        color: C.destructive,
        fontSize: 13,
        marginTop: 6,
        marginLeft: 4,
      } as const,
    }),
    [scheme, value]
  );

  return (
    <View style={S.wrap}>
      <Animated.View
        style={[
          S.box,
          {
            borderColor: errorText ? C.destructive : (borderColor as any),
            borderWidth: errorText ? 2 : (borderWidth as any),
            shadowColor: errorText ? C.destructive : C.primary,
            shadowOpacity: errorText ? 0.18 : (shadowOpacity as any),
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
            ...(Platform.OS === "android"
              ? { elevation: errorText ? 2 : 1 }
              : null),
          },
        ]}
      >
        <Animated.Text
          style={[
            {
              position: "absolute",
              left: labelLeft,
              paddingHorizontal: 6,
              borderRadius: 8,
              backgroundColor: C.input,
              alignSelf: "flex-start",
              transform: [{ translateY: labelY as any }],
              fontSize: labelSize as any,
              color: errorText ? C.destructive : (labelColor as any),
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>

        <TouchableOpacity style={S.row} activeOpacity={0.9} onPress={onPress}>
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
              style={S.leftIcon}
            />
          ) : null}

          <Text style={S.val}>{value || ""}</Text>

          <View style={S.rightIconWrap}>
            <Ionicons
              name={rightIcon}
              size={18}
              color={errorText ? C.destructive : C.mutedForeground}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {errorText ? <Text style={S.err}>{errorText}</Text> : null}
    </View>
  );
}
