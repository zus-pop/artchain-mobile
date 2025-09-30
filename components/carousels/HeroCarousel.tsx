// components/carousels/HeroCarousel.tsx
import React, { useState } from "react";
import { Dimensions, Image, StyleSheet, View, ViewStyle } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const W = Dimensions.get("window").width;

type Slide = { id: string; image: string };

export default function HeroCarousel({
  data,
  height = 200,
  inset = 16, // thu vào 2 bên
  radius = 16, // bo góc
  autoPlayInterval = 3000,
  containerStyle,
}: {
  data: Slide[];
  height?: number;
  inset?: number;
  radius?: number;
  autoPlayInterval?: number;
  containerStyle?: ViewStyle;
}) {
  const [index, setIndex] = useState(0);
  const width = W - inset * 2;

  return (
    <View style={[{ paddingHorizontal: inset }, containerStyle]}>
      <View style={[styles.card, { width, height, borderRadius: radius }]}>
        <Carousel<Slide>
          width={width}
          height={height}
          data={data}
          loop
          autoPlay
          autoPlayInterval={autoPlayInterval}
          scrollAnimationDuration={800} // mượt hơn
          onSnapToItem={(i) => setIndex(i)}
          // thử parallax mịn hơn:
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.92,
            parallaxScrollingOffset: 30,
          }}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item.image }}
              style={{ width: "100%", height: "100%"  , borderRadius: radius }}
              resizeMode="cover"
            />
          )}
        />

        {/* Dots ở giữa đáy */}
        {data.length > 1 && (
          <View style={styles.dotsWrap} pointerEvents="none">
            <View style={styles.dotsBg}>
              {data.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === index ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden", // để bo góc ảnh
  },
  dotsWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dotsBg: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: "#fff",
  },
  dotInactive: { width: 8, opacity: 0.5 },
  dotActive: { width: 16, opacity: 1 },
});
