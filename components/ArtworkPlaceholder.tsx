import { Colors, withOpacity } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
// Nếu sợ lucide không load icon, có thể fallback Ionicons
import { Camera } from "lucide-react-native";
// import { Ionicons } from "@expo/vector-icons";

type Props = {
  height?: number;
  rounded?: number;
  onPress?: () => void;
  message?: string;
  style?: ViewStyle;
  solidBorder?: boolean; // false = dashed
};

export default function ArtworkPlaceholder({
  height, // không ép, để parent tự quyết, chỉ minHeight
  rounded = 12,
  onPress,
  message = "Tranh sẽ được chúng tôi cập nhập \n sớm nhất có thể",
  style,
  solidBorder = false,
}: Props) {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const Container: any = onPress ? TouchableOpacity : View;

  const bgTint = withOpacity(
    C.mutedForeground,
    scheme === "dark" ? 0.08 : 0.05
  );
  const dashColor = withOpacity(C.mutedForeground, 0.38);

  return (
    <Container
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        {
          minHeight: height ?? 160, // đảm bảo không bị bẹp
          width: "100%",
        },
        style,
      ]}
    >
      {/* Lớp nền nhạt */}
      <View style={[StyleSheet.absoluteFill]} />

      {/* Khung nét đứt / liền phía trong */}
      <View
        style={[
          styles.innerFrame,
          {
   

            borderColor: dashColor,
            borderStyle: solidBorder ? "solid" : "dashed",
          },
        ]}
      />

      {/* Nội dung center tuyệt đối */}
      <View style={styles.centerWrap} pointerEvents="none">
        <View style={[styles.iconWrap, { borderColor: C.primary }]}>
          {/* <Ionicons name="camera-outline" size={28} color={C.primary} /> */}
          <Camera size={28} color={C.primary} />
        </View>

        <Text
          style={[
            styles.text,
            {
              color: scheme === "dark" ? C.mutedForeground : "#334155", // tăng tương phản ở light
            },
          ]}
          numberOfLines={2}
        >
          {message}
        </Text>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  innerFrame: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
  },
  centerWrap: {
    position: "absolute",
    inset: 0 as any,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Be Vietnam Pro",
  },
});
