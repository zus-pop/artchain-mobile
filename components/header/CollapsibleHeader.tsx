// components/CollapsibleHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedLinear = Animated.createAnimatedComponent(LinearGradient);
const { width: W } = Dimensions.get("window");
export const HEADER_EXPANDED = 140;
export const HEADER_COLLAPSED = 64;

const SCROLL_RANGE = HEADER_EXPANDED - HEADER_COLLAPSED;
const AVATAR = 40;
const CARD_W_RATIO = 0.92;
const CARD_H = 140; // cao thẻ trắng
const CARD_OVERLAP = 0.5;

const Palettes = {
  rainbowA: ["#4FACFE", "#6B57FF", "#FF61D2", "#FFA84B", "#FFE259"],
  rainbowB: ["#3EADF2", "#5D3FD3", "#F94CA4", "#FF7E5F", "#FBD786"],

  pastelA: ["#FADADD", "#A7E6FF", "#FFF8B5"],
  pastelB: ["#FCE4EC", "#BDE3FF", "#FFF2C6"],

  neonA: ["#00FFC6", "#FF3CAC", "#562B7C"],
  neonB: ["#00E6B2", "#FF5BB6", "#3C1B5C"],
} as const;

type GradientMode = "rainbow" | "pastel" | "neon";

export default function CollapsibleHeader({
  progress,
  username = "Hoàng Trí",
  gradientMode = "rainbow", // <— CHỌN 1 TRONG 3: 'rainbow' | 'pastel' | 'neon'
}: {
  progress: Animated.Value;
  username?: string;
  gradientMode?: GradientMode;
}) {
  const insets = useSafeAreaInsets();

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(HEADER_EXPANDED - HEADER_COLLAPSED)],
  });

  const nameOpacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });
  const cardOpacity = progress.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [1, 0, 0],
  });
  const iconRowOpacity = progress.interpolate({
    inputRange: [0.25, 0.6, 1],
    outputRange: [0, 1, 1],
  });
  const iconRowY = progress.interpolate({
    inputRange: [0.25, 1],
    outputRange: [12, 0],
  });

  // Card trượt nhẹ ra/vào cho đẹp
  const cardTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const cardTop = insets.top + HEADER_EXPANDED - CARD_H * CARD_OVERLAP;

  const avatarCounterY = Animated.multiply(translateY, -1); // giữ avatar cố định

  // (tuỳ chọn) muốn avatar hơi thu nhỏ khi thu gọn:
  const avatarScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.92],
  });

  // ---- Gradient loop (crossfade 2 lớp) ----
  const g = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(g, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true, // chỉ animate opacity
        }),
        Animated.timing(g, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [g]);

  const [gradA, gradB] =
    gradientMode === "pastel"
      ? [Palettes.pastelA, Palettes.pastelB]
      : gradientMode === "neon"
      ? [Palettes.neonA, Palettes.neonB]
      : [Palettes.rainbowA, Palettes.rainbowB];
  return (
    <Animated.View
      style={[
        styles.header,
        {
          height: HEADER_EXPANDED + insets.top,
          paddingTop: insets.top,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.maskBg} pointerEvents="none">
        <AnimatedLinear
          colors={gradA}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            StyleSheet.absoluteFill,
            { opacity: Animated.subtract(1, g) },
          ]}
        />
        <AnimatedLinear
          colors={gradB}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, { opacity: g }]}
        />
      </View>

      {/* Nhóm text chừa chỗ cho avatar, ẩn dần khi thu gọn */}
      <View style={styles.headerTextWrap}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.avatarBtn,
            { transform: [{ translateY: avatarCounterY }] }, // giữ avatar đứng yên khi header translate
          ]}
        >
          <Ionicons name="person-circle" size={40} color="#fff" />
        </TouchableOpacity>

        <View>
          <Animated.Text style={[styles.hello, { opacity: nameOpacity }]}>
            Xin chào,
          </Animated.Text>
          <Animated.Text
            style={[styles.username, { opacity: nameOpacity }]}
            numberOfLines={1}
          >
            {username}
          </Animated.Text>
        </View>
      </View>

      {/* Row icon khi thu gọn (giữ nguyên) */}
      <Animated.View
        style={[
          styles.iconRow,
          {
            overflow: "hidden",
            top: insets.top + 8, // cùng hàng với avatar
            left: 12 + AVATAR + 8, // ngay sau avatar (chừa 8px)
            right: 16, // đến mép phải
            opacity: iconRowOpacity,
            transform: [
              { translateY: avatarCounterY },
              { translateY: iconRowY },
            ],
          },
        ]}
      >
        <Icon name="add-circle-outline" />
        <Icon name="refresh-circle-outline" />
        <Icon name="wallet-outline" />
        <Icon name="headset-outline" />
      </Animated.View>

      {/* Card nổi (fade khi kéo) */}
      <Animated.View
        style={[styles.card, { top: cardTop, opacity: cardOpacity }]}
      >
        <View style={styles.balanceRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.balanceTitle}>FUTAPay</Text>
            <Text style={styles.balanceValue}>0đ</Text>
          </View>
          <View style={styles.divider} />
          <View style={{ flex: 1 }}>
            <Text style={styles.balanceTitle}>TK khuyến mãi</Text>
            <Text style={styles.balanceValue}>0đ</Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <Quick icon="add-outline" label="Nạp tiền" />
          <Quick icon="swap-vertical-outline" label="Rút tiền" />
          <Quick icon="card-outline" label="FUTAPay" />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function Icon({ name }: { name: any }) {
  return (
    <View style={{ marginLeft: 18 }}>
      <TouchableOpacity activeOpacity={0.8} style={styles.headerIconBtn}>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: "rgba(255,255,255,0.2)",
          }}
        >
          <Ionicons name={name} size={24} color="#fff" />
        </View>
      </TouchableOpacity>
    </View>
  );
}
function Quick({ icon, label }: { icon: any; label: string }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.quickBtn}>
      <Ionicons name={icon} size={22} color="#f97316" />
      <Text style={styles.quickTxt}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    zIndex: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },

  // avatar luôn hiện
  avatarBtn: {
    position: "absolute",
    top: 8, // tinh chỉnh nếu muốn
    left: 12,
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 12,
  },

  // khối text nằm dưới avatar, chừa padding-left đúng bằng avatar + khoảng cách
  headerTextWrap: {
    paddingLeft: 12 + AVATAR + 8, // left + avatar + gap
    paddingRight: 16,
    paddingTop: 4,
  },

  hello: { color: "#fff", fontSize: 16, fontWeight: "600" },
  username: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 2 },

  iconRow: {
    position: "absolute",
    height: AVATAR, // 40
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // hoặc "space-evenly" nếu muốn đều cả 2 mép
  },
  headerRow: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.9)",
    marginRight: 25,
  },

  card: {
    position: "absolute",
    left: (W - W * 0.92) / 2,
    width: W * 0.92,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    zIndex: 11,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 8,
  },
  balanceTitle: { color: "#6b7280", fontSize: 12, marginBottom: 2 },
  balanceValue: { color: "#f97316", fontSize: 16, fontWeight: "800" },
  actionRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
  },
  quickBtn: {
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 80,
  },
  quickTxt: { marginTop: 4, fontSize: 12, color: "#111827", fontWeight: "600" },
  maskBg: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden", // chỉ lớp nền bị clip
  },
});
