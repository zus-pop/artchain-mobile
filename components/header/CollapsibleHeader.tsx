// components/CollapsibleHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: W } = Dimensions.get("window");
export const HEADER_EXPANDED = 60;
export const HEADER_COLLAPSED = 64;

const AVATAR = 40;

// CAM NHẠT — đổi tại đây nếu muốn sắc khác
const HEADER_BG = "#F07167";

export default function CollapsibleHeader({
  progress,
  username = "Hoàng Trí",
}: {
  progress: Animated.Value;
  username?: string;
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

  // giữ avatar đứng yên khi header trượt
  const avatarCounterY = Animated.multiply(translateY, -1);

  return (
    <Animated.View
      style={[
        styles.header,
        {
          height: HEADER_EXPANDED + insets.top,
          paddingTop: insets.top,
          transform: [{ translateY }],
          backgroundColor: HEADER_BG,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* NỀN ĐƠN GIẢN: chỉ 1 màu cam nhạt, không gradient */}
      <View style={styles.flatBg} pointerEvents="none" />

      {/* Nhóm text + avatar */}
      <View style={styles.headerTextWrap}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.avatarBtn,
            { transform: [{ translateY: avatarCounterY }] },
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
  },
  // nền phẳng (không màu mè)
  flatBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 1,
  },

  // avatar luôn hiện
  avatarBtn: {
    position: "absolute",
    top: 8,
    left: 12,
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 12,
  },

  // khối text nằm dưới avatar
  headerTextWrap: {
    paddingLeft: 12 + AVATAR + 8,
    paddingRight: 16,
    paddingTop: 4,
  },

  hello: { color: "#fff", fontSize: 16, fontWeight: "600" },
  username: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 2 },
});
