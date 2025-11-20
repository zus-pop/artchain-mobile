// components/animations/ArtchainAnimation.tsx
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

type Props = {
  style?: StyleProp<ViewStyle>;
  autoPlay?: boolean;
  loop?: boolean;
};

export default function ArtchainAnimation({
  style,
  autoPlay = true,
  loop = true,
}: Props) {
  const ref = useRef<LottieView>(null);

  useEffect(() => {
    if (autoPlay) {
      ref.current?.play();
    }
  }, [autoPlay]);

  return (
    <View style={[{ alignItems: "center", justifyContent: "center" }, style]}>
      <LottieView
        ref={ref}
        source={require("@/assets/lottie/artchain.json")}
        autoPlay={autoPlay}
        loop={loop}
        style={{ width: 220, height: 220 }}
        resizeMode="contain"
      />
    </View>
  );
}
