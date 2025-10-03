// components/headers/StickyProfileHeader.tsx
import type { ColorTokens } from "@/types/tabkey";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title: string;
  colors: ColorTokens;
  scrollY: Animated.Value;
  /** px bắt đầu hiện title */
  showAt?: number;
  /** chiều cao phần thân header (chưa gồm safe area) */
  height?: number;

  /** tuỳ chọn nút */
  showBack?: boolean; // default: false
  backIcon?: keyof typeof Ionicons.glyphMap;
  onBack?: () => void;

  showRight?: boolean; // default: false
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
};

const StickyProfileHeader: React.FC<Props> = ({
  title,
  colors: C,
  scrollY,
  showAt = 56,
  height = 50,
  showBack = false,
  backIcon = "chevron-back",
  onBack,
  showRight = false,
  rightIcon = "settings-outline",
  onRightPress,
}) => {
  const insets = useSafeAreaInsets();
  const H = insets.top + height;

  // nền từ trong suốt -> card
  const bgOpacity = scrollY.interpolate({
    inputRange: [0, showAt * 0.6, showAt],
    outputRange: [0, 0.6, 1],
    extrapolate: "clamp",
  });

  // viền dưới
  const borderOpacity = scrollY.interpolate({
    inputRange: [0, showAt, showAt + 12],
    outputRange: [0, 0.4, 0.7],
    extrapolate: "clamp",
  });

  // tiêu đề (fade + trượt lên 6px)
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, showAt, showAt + 24],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });
  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, showAt, showAt + 24],
    outputRange: [6, 6, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.wrap, { height: H, paddingTop: insets.top }]}>
      {/* nền */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: C.card,
            opacity: bgOpacity,
          },
        ]}
      />
      {/* viền */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.bottomLine,
          { backgroundColor: C.border, opacity: borderOpacity },
        ]}
      />

      {/* trái */}
      <View style={styles.side}>
        {showBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.iconBtn}
            hitSlop={HIT}
          >
            <Ionicons name={backIcon} size={24} color={C.foreground} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>

      {/* tiêu đề */}
      <Animated.View
        pointerEvents="none"
        style={{
          flex: 1,
          alignItems: "center",
          transform: [{ translateY: titleTranslateY }],
        }}
      >
        <Animated.Text
          numberOfLines={1}
          style={[styles.title, { color: C.foreground, opacity: titleOpacity }]}
        >
          {title}
        </Animated.Text>
      </Animated.View>

      {/* phải */}
      <View style={styles.side}>
        {showRight ? (
          <TouchableOpacity
            onPress={onRightPress}
            style={styles.iconBtn}
            hitSlop={HIT}
          >
            <Ionicons name={rightIcon} size={22} color={C.foreground} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>
    </View>
  );
};

export default StickyProfileHeader;

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    // bóng rất nhẹ
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: Platform.OS === "android" ? 2 : 0,
  },
  bottomLine: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
  },
  side: { width: 44, alignItems: "center", justifyContent: "center" },
  iconBtn: { padding: 8, borderRadius: 999 },
  title: { fontSize: 18, fontWeight: "800", letterSpacing: 0.2 },
});
