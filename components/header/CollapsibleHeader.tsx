// components/CollapsibleHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";

export const HEADER_EXPANDED = 60;
export const HEADER_COLLAPSED = 64;

const AVATAR = 40;

export default function CollapsibleHeader({
  progress,
  username,
}: {
  progress: Animated.Value;
  username: string;
}) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? "light"];
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const nameOpacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1, 1],
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
        },
        { backgroundColor: colors.background },
      ]}
      pointerEvents="box-none"
    >
      {/* SUBTLE PRIMARY GRADIENT - SYNCED WITH BACKGROUND */}
      <LinearGradient
        colors={[
          "rgba(239, 68, 68, 0.12)",
          "rgba(239, 68, 68, 0.06)",
          "rgba(0,0,0,0)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Nhóm text + avatar */}
      <View style={styles.headerTextWrap}>
        <TouchableOpacity activeOpacity={0.8} style={[styles.avatarBtn]}>
          <Ionicons name="person-circle" size={40} color={colors.foreground} />
        </TouchableOpacity>

        <View>
          <Animated.Text
            style={[
              styles.hello,
              {
                opacity: nameOpacity,
                color: colors.foreground,
              },
            ]}
          >
            Xin chào,
          </Animated.Text>
          <Animated.Text
            style={[
              styles.username,
              {
                opacity: nameOpacity,
                color: colors.foreground,
              },
            ]}
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
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
  },

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

  headerTextWrap: {
    paddingLeft: 12 + AVATAR + 8,
    paddingRight: 16,
    paddingTop: 4,
  },

  hello: { color: "#fff", fontSize: 16, fontWeight: "600" },
  username: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 2 },
});
