// components/AppHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type AppHeaderProps = {
  title: string;
  /** hiện nút back hay không */
  showBack?: boolean;
  /** icon bên phải (nếu cần), vd: "notifications-outline" */
  rightIconName?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  /** custom background (nếu muốn) */
  backgroundColor?: string;
  /** bar màu chữ dark hay light (ảnh hưởng StatusBar) */
  darkContent?: boolean;
};

export default function AppHeader({
  title,
  showBack = false,
  rightIconName,
  onRightPress,
  backgroundColor,
  darkContent = false,
}: AppHeaderProps) {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];

  return (
    <View style={[styles.wrapper, { backgroundColor: C.foreground80 }]}>
      {/* StatusBar cho cả Android & iOS, KHÔNG translucent để khỏi chui xuống dưới */}
      <StatusBar
        translucent={false}
        backgroundColor={C.foreground80}
        barStyle={darkContent ? "dark-content" : "light-content"}
      />

      {/* Safe area chỉ ăn phần top, tránh dư khoảng trắng, chạy chuẩn iOS + Android */}
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={{ backgroundColor: C.foreground80 }}
      >
        <View style={styles.inner}>
          {/* Left: back hoặc trống để title luôn nằm giữa */}
          <View style={styles.sideLeft}>
            {showBack && (
              <TouchableOpacity
                onPress={() => router.back()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.iconBtn}
              >
                <Ionicons
                  name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
                  size={22}
                  color={darkContent ? "#111" : "#fff"}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Title center */}
          <View style={styles.center}>
            <Text
              numberOfLines={1}
              style={[styles.title, { color: darkContent ? "#111" : "#fff" }]}
            >
              {title}
            </Text>
          </View>

          {/* Right icon (optional) */}
          <View style={styles.sideRight}>
            {rightIconName && (
              <TouchableOpacity
                onPress={onRightPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.iconBtn}
              >
                <Ionicons
                  name={rightIconName}
                  size={22}
                  color={darkContent ? "#111" : "#fff"}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 10,
    // Không paddingTop ở đây, SafeAreaView lo phần top
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
    minHeight: 48, // chiều cao tối thiểu cho header
  },
  sideLeft: {
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sideRight: {
    width: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  iconBtn: {
    padding: 4,
  },
});
