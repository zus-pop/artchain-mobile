// components/PressDateField.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  label: string;
  value?: string; // "YYYY-MM-DD"
  onChange: (yyyyMMdd: string) => void;
  minDate?: Date;
  maxDate?: Date;
  errorText?: string;
  leftIcon?: React.ComponentProps<typeof Ionicons>["name"];
};

function toYYYYMMDD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseMaybeDate(value?: string) {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

export default function PressDateField({
  label,
  value,
  onChange,
  minDate = new Date(1900, 0, 1),
  maxDate = new Date(),
  errorText,
  leftIcon = "calendar-outline",
}: Props) {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const INPUT_H = 56;
  const ICON = 20;
  const PADX = 12;
  const GAP = 8;
  const labelLeft = leftIcon ? PADX + ICON + GAP : PADX;

  const [open, setOpen] = useState(false);
  const currentDate = parseMaybeDate(value) ?? new Date();

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
    outputRange: [INPUT_H / 2 - 29, -18],
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

  const displayText = useMemo(() => {
    if (!value) return "";
    const d = parseMaybeDate(value);
    if (!d) return value;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }, [value]);

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

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setOpen(true)}
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
              style={{ width: ICON, marginRight: 8, textAlign: "center" }}
            />
          ) : null}

          <Text
            style={{
              flex: 1,
              fontSize: 16,
              color: value ? C.foreground : C.mutedForeground,
            }}
          >
            {displayText || "Chọn ngày sinh"}
          </Text>

          <Ionicons
            name="chevron-down"
            size={18}
            color={errorText ? C.destructive : C.mutedForeground}
          />
        </TouchableOpacity>
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

      {/* Picker */}
      {Platform.OS === "android" ? (
        open ? (
          <DateTimePicker
            value={currentDate}
            mode="date"
            display="default"
            maximumDate={maxDate}
            minimumDate={minDate}
            onChange={(_, d) => {
              setOpen(false);
              if (d) onChange(toYYYYMMDD(d));
            }}
          />
        ) : null
      ) : (
        <Modal
          visible={open}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setOpen(false)}
        >
          <View style={{ flex: 1, backgroundColor: C.background }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: C.card,
                paddingHorizontal: 16,
                paddingTop: 50,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: C.border,
              }}
            >
              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={{ padding: 8, marginRight: 8 }}
              >
                <Ionicons name="close" size={24} color={C.primary} />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: C.foreground,
                  flex: 1,
                }}
              >
                Chọn ngày
              </Text>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={{ padding: 8 }}
              >
                <Text style={{ color: C.primary, fontWeight: "600" }}>
                  Xong
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <DateTimePicker
                value={currentDate}
                mode="date"
                display="spinner"
                maximumDate={maxDate}
                minimumDate={minDate}
                onChange={(_, d) => {
                  if (d) onChange(toYYYYMMDD(d));
                }}
                style={{ backgroundColor: C.card }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
