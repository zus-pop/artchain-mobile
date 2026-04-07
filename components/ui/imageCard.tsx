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
  title = " - NƠI SÁNG TẠO KHÔNG GIỚI HẠN",
  subtitle = "Tham gia ngay để khám phá thế giới nghệ thuật số độc đáo và kết nối với cộng đồng sáng tạo toàn cầu!",

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
          <Text style={styles.title}><Text style={{color :"hsl(15 85% 55%)"}}>ARTCHAIN</Text>
          {title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

         
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
