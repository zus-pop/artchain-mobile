// components/FlightPromoCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  image: ImageSourcePropType | string; // require(...) hoặc URL
  onPress?: () => void;
  height?: number; // tuỳ chỉnh
};

export default function ImageCard({
  title = "CUỘC THI \nNÉT VẼ XANH 2025",
  subtitle = "Gửi gắm những câu chuyện,\ný tưởng và khát vọng qua \nmàu sắc độc đáo của riêng mình. ",
  buttonText = "Xem Triển Lãm ",
  image,
  onPress,
  height = 180,
}: Props) {
  const src =
    typeof image === "string" ? { uri: image } : (image as ImageSourcePropType);

  return (
    <View
      style={[
        styles.shadow,
        { borderRadius: 16, alignItems: "center", justifyContent: "center" },
      ]}
    >
      <ImageBackground
        source={src}
        imageStyle={{ borderRadius: 6 }}
        style={[styles.bg, { height }]}
        resizeMode="cover"
      >
        {/* Overlay gradient tím hồng nhạt giống ảnh mẫu */}
        <LinearGradient
          colors={["rgba(71, 24, 95, 0.15)", "rgba(80, 32, 132, 0.35)"]}
          start={{ x: 0.1, y: 0.2 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Nội dung */}
        <View style={styles.contentWrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <Pressable
            onPress={onPress}
            style={({ pressed }) => [
              styles.cta,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <Text style={styles.ctaText}>{buttonText}</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  bg: {
    width: "100%",
    borderRadius: 6,
    overflow: "hidden",
  },
  contentWrap: {
    flex: 1,
    paddingHorizontal: 32,

    justifyContent: "center",
  },
  title: {
    color: "#000",
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 6,
    fontFamily: "Be Vietnam Pro",
  },
  subtitle: {
    color: "rgba(0, 0, 0, 1)",
    fontSize: 11.5,
    lineHeight: 13,
    marginBottom: 12,

    width: "65%",
    fontFamily: "Be Vietnam Pro",
  },
  cta: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
   
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: "#E55C00",
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "400",
    fontFamily: "Be Vietnam Pro",
  },
});
