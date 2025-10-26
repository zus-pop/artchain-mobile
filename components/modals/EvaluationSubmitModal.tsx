// components/modals/EvaluationSubmitModal.tsx
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  ColorValue,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

/** ---------- Kiểu ---------- */
type Variant = "confirm" | "success";

export type EvaluationSubmitModalProps = {
  visible: boolean;
  variant?: Variant;
  title?: string;
  subtitle?: string;
  primaryText?: string; // nút chính: "Gửi" / "Tiếp tục"
  secondaryText?: string; // nút phụ: "Huỷ" (chỉ dùng cho confirm)
  onPrimary?: () => void;
  onSecondary?: () => void;
  onDismiss?: () => void; // tap backdrop hoặc đóng
  loading?: boolean; // khi đang mutate
  backdropStyle?: ViewStyle;
};

/** ---------- Helpers ---------- */
type Grad = readonly [ColorValue, ColorValue];

const asGrad = (a: ColorValue, b: ColorValue): Grad => [a, b] as const;

const POOLS: readonly Grad[] = [
  asGrad("#22C55E", "#10B981"), // xanh mướt (mặc định success)
  asGrad("#06B6D4", "#3B82F6"),
  asGrad("#F59E0B", "#F97316"),
  asGrad("#6366F1", "#A78BFA"),
  asGrad("#F43F5E", "#FB7185"),
];

const pickGrad = (i = 0): Grad => POOLS[i % POOLS.length];

/** ---------- Confetti nhỏ gọn ---------- */
function Confetti({ show }: { show: boolean }) {
  const pieces = 16;
  const arr = useMemo(() => Array.from({ length: pieces }), []);
  const animsRef = useRef([...Array(pieces)].map(() => new Animated.Value(0)));
  const anims = animsRef.current;

  useEffect(() => {
    if (!show) return;
    const seq = anims.map((v, idx) => {
      v.setValue(0);
      const delay = 50 * idx;
      return Animated.timing(v, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
        delay,
      });
    });
    Animated.stagger(20, seq).start();
  }, [show, anims]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {arr.map((_, i) => {
        const v = anims[i];
        const x = v.interpolate({
          inputRange: [0, 1],
          outputRange: [0, (i % 2 ? -1 : 1) * (80 + (i % 5) * 12)],
        });
        const y = v.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 140 + (i % 7) * 10],
        });
        const r = v.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", `${(i % 2 ? -1 : 1) * (180 + i * 12)}deg`],
        });
        const [c0, c1] = pickGrad(i);
        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: 10,
              width: 10,
              height: 18,
              borderRadius: 3,
              overflow: "hidden",
              transform: [{ translateX: x }, { translateY: y }, { rotate: r }],
              opacity: v.interpolate({
                inputRange: [0, 0.8, 1],
                outputRange: [0, 1, 0.2],
              }),
            }}
          >
            <LinearGradient
              colors={[c0, c1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

/** ---------- Modal chính ---------- */
export default function EvaluationSubmitModal({
  visible,
  variant = "confirm",
  title,
  subtitle,
  primaryText,
  secondaryText = "Huỷ",
  onPrimary,
  onSecondary,
  onDismiss,
  loading,
  backdropStyle,
}: EvaluationSubmitModalProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? "light"];

  // Animations
  const scale = useRef(new Animated.Value(0.92)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 140,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.92);
      fade.setValue(0);
    }
  }, [visible, scale, fade]);

  const isSuccess = variant === "success";
  const [g0, g1] = isSuccess ? POOLS[0] : asGrad("#06B6D4", "#3B82F6");
  const iconName = (
    isSuccess ? "checkmark" : "help"
  ) as keyof typeof Ionicons.glyphMap;
  const iconBg: Grad = isSuccess
    ? asGrad("#22C55E", "#10B981")
    : asGrad("#06B6D4", "#3B82F6");

  return (
    <Modal
      visible={visible}
      onRequestClose={onDismiss}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      hardwareAccelerated
    >
      {/* Backdrop */}
      <Pressable
        style={[
          styles.backdrop,
          { backgroundColor: "rgba(2,6,23,0.55)" },
          backdropStyle,
        ]}
        onPress={onDismiss}
      />

      {/* Card */}
      <Animated.View
        style={[styles.centerWrap, { transform: [{ scale }], opacity: fade }]}
      >
        {/* Viền gradient */}
        <View style={styles.borderWrap}>
          <LinearGradient
            colors={[g0, g1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.borderFill}
          />
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {/* Icon tròn */}
            <LinearGradient
              colors={iconBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircle}
            >
              <Ionicons name={iconName} size={38} color="#fff" />
            </LinearGradient>

            <ThemedText style={[styles.title, { color: colors.foreground }]}>
              {title || (isSuccess ? "Đã gửi đánh giá" : "Gửi đánh giá?")}
            </ThemedText>
            <ThemedText
              style={[styles.subtitle, { color: colors.mutedForeground }]}
            >
              {subtitle ||
                (isSuccess
                  ? "Cảm ơn bạn! Bài chấm đã được ghi nhận."
                  : "Xác nhận nộp điểm và nhận xét cho tác phẩm này.")}
            </ThemedText>

            {/* Nút */}
            <View style={styles.actions}>
              {!isSuccess && (
                <TouchableOpacity
                  onPress={onSecondary}
                  style={[
                    styles.ghostBtn,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.input,
                    },
                  ]}
                >
                  <ThemedText
                    style={{ color: colors.mutedForeground, fontWeight: "800" }}
                  >
                    {secondaryText}
                  </ThemedText>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={onPrimary}
                disabled={loading}
                style={[styles.primaryBtn, { opacity: loading ? 0.7 : 1 }]}
              >
                <LinearGradient
                  colors={[g0, g1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryFill}
                >
                  <ThemedText style={{ color: "#fff", fontWeight: "900" }}>
                    {primaryText || (isSuccess ? "Tiếp tục" : "Gửi")}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Confetti khi success */}
      <Confetti show={visible && isSuccess} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centerWrap: {
    position: "absolute",
    left: 18,
    right: 18,
    top: "26%",
  },
  borderWrap: { position: "relative", borderRadius: 20 },
  borderFill: {
    position: "absolute",
    inset: 0,
    borderRadius: 20,
    opacity: 0.9,
  },
  card: {
    margin: 2,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    alignSelf: "stretch",
    justifyContent: "center",
    marginTop: 4,
  },
  ghostBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtn: {
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 140,
  },
  primaryFill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
