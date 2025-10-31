import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  title?: string;
  backgroundColor?: string; // brand color
  onBack?: () => void;
  borderBottom?: boolean;
  right?: React.ReactNode;
  backLabel?: string; // ví dụ: "Quay lại"
};

const BRAND = "#dc5a54";
const TOP = Platform.OS === "ios" ? 44 : (StatusBar.currentHeight ?? 0) + 8;

/* ---------- Nút Back nâng cấp ---------- */
function BackButton({
  onPress,
  tint = "#fff",
  border = "rgba(255,255,255,0.55)",
  label,
}: {
  onPress: () => void;
  tint?: string;
  border?: string;
  label?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 6,
    }).start();
  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        android_ripple={{ color: "rgba(255,255,255,0.25)", borderless: false }}
        style={({ pressed }) => [
          styles.backWrap,
          {
            borderColor: border,
            backgroundColor: pressed ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.16)", // nền mờ tinh tế
          },
        ]}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={label ?? "Quay lại"}
      >
        <Ionicons name="chevron-back" size={22} color={tint} />
        {label ? (
          <Text style={[styles.backLabel, { color: tint }]} numberOfLines={1}>
            {label}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

/* ---------- Header ---------- */
export default function AppHeader({
  title,
  backgroundColor = BRAND,
  onBack,
  borderBottom = false,
  right,
  backLabel,
}: Props) {
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor },
        borderBottom && styles.withBorder,
      ]}
    >
      <StatusBar barStyle="light-content" />
      <View style={{ height: TOP }} />

      <View style={styles.row}>
        <BackButton
          onPress={onBack ?? (() => router.back())}
          tint="#fff"
          border="rgba(255,255,255,0.45)"
          label={backLabel} // truyền "Quay lại" để hiện chữ, hoặc bỏ để chỉ icon
        />

        <Text style={styles.title} numberOfLines={1}>
          {title ?? ""}
        </Text>

        <View style={styles.right}>{right}</View>
      </View>
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 10,
  },
  withBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.4)",
  },
  row: {
    height: 48,
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
  },
  /* Back button */
  backWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    height: 36,
    minWidth: 36,
    borderRadius: 12, // mềm nhưng không quá bo
    borderWidth: 1, // viền mảnh
  },
  backLabel: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  title: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  right: {
    minWidth: 36,
    alignItems: "flex-end",
    height: 36,
    justifyContent: "center",
  },
});
