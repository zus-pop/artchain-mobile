// components/CollapsibleHeader.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

  return (
    <Animated.View
      style={[
        styles.header,
        {
          height: HEADER_EXPANDED + insets.top,
          paddingTop: insets.top,
        },
        { backgroundColor: colors.foreground80 },
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
          <Ionicons name="person-circle" size={42} color={colors.background} />
        </TouchableOpacity>

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Animated.Text
            style={[
              styles.username,
              {
                opacity: nameOpacity,
                color: colors.background,
              },
            ]}
          >
            Chào,
          </Animated.Text>
          <Animated.Text
            style={[
              styles.username,
              {
                opacity: nameOpacity,
                color: colors.background,
              },
            ]}
          >
            {username}
          </Animated.Text>
          <MaterialCommunityIcons name="hand-wave" size={24} color="#FFA500" />
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

    borderBottomRightRadius: 76,
    overflow: "hidden",
    borderWidth: 0.1,
  },

  avatarBtn: {
    position: "absolute",

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
    alignContent: "center",
    justifyContent: "center",
  },

  hello: { fontSize: 16, fontWeight: "600" },
  username: { fontSize: 22, fontWeight: "800", marginTop: 2 },
});
