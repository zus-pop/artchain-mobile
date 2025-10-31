import { Image } from "expo-image";
import React, { useCallback, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  source: { uri: string } | number;
  maxScale?: number;
  onSingleTap?: () => void;
  onScaleChange?: (s: number) => void; // NEW
  simultaneousHandlers?: any; // NEW
  contentFit?: "contain" | "cover"; // optional
};

export default function ZoomPanView({
  source,
  maxScale = 4,
  onSingleTap,
  onScaleChange,
  simultaneousHandlers,
  contentFit = "contain",
}: Props) {
  // Kích thước khung thực tế
  const cw = useSharedValue(0);
  const ch = useSharedValue(0);

  const [cwState, setCwState] = useState(0);
  const [chState, setChState] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    cw.value = width;
    ch.value = height;
    setCwState(width);
    setChState(height);
  };

  // state
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);

  const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n));
  const clampToBounds = (s: number) => {
    // dựa vào kích thước khung thực tế
    const _cw = cw.value || cwState;
    const _ch = ch.value || chState;
    if (!_cw || !_ch || s <= 1) return { x: 0, y: 0 };
    const extraW = (_cw * s - _cw) / 2;
    const extraH = (_ch * s - _ch) / 2;
    return { x: extraW, y: extraH };
  };

  const notifyScale = useCallback(
    (s: number) => {
      if (onScaleChange) onScaleChange(s);
    },
    [onScaleChange]
  );

  const tap = Gesture.Tap()
    .numberOfTaps(1)
    .maxDeltaX(6)
    .maxDeltaY(6)
    .onEnd((_e, ok) => {
      if (ok && onSingleTap) runOnJS(onSingleTap)();
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e, ok) => {
      if (!ok) return;
      const target = scale.value > 1 ? 1 : 2;
      const ratio = target / scale.value;

      const _cw = cw.value || cwState;
      const _ch = ch.value || chState;
      const dx = (e.x - _cw / 2) * (1 - ratio);
      const dy = (e.y - _ch / 2) * (1 - ratio);

      scale.value = withTiming(target, { duration: 180 }, (finished) => {
        if (finished) runOnJS(notifyScale)(target);
      });
      tx.value = withTiming(tx.value + dx, { duration: 180 });
      ty.value = withTiming(ty.value + dy, { duration: 180 });
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      savedScale.value = scale.value;
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    })
    .onUpdate((e) => {
      const nextScale = clamp(savedScale.value * e.scale, 1, maxScale);

      const _cw = cw.value || cwState;
      const _ch = ch.value || chState;
      if (!_cw || !_ch) return;

      const ratio = nextScale / savedScale.value;
      const dx = (e.focalX - _cw / 2) * (1 - ratio);
      const dy = (e.focalY - _ch / 2) * (1 - ratio);

      scale.value = nextScale;
      const candidateX = savedTx.value + dx;
      const candidateY = savedTy.value + dy;
      const b = clampToBounds(nextScale);
      tx.value = clamp(candidateX, -b.x, b.x);
      ty.value = clamp(candidateY, -b.y, b.y);

      // thông báo cho parent trên JS thread
      if (onScaleChange) runOnJS(notifyScale)(nextScale);
    });

  const pan = Gesture.Pan()
    .onBegin(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    })
    .onUpdate((e) => {
      if (scale.value <= 1) return;
      const b = clampToBounds(scale.value);
      tx.value = clamp(savedTx.value + e.translationX, -b.x, b.x);
      ty.value = clamp(savedTy.value + e.translationY, -b.y, b.y);
    });

  const composed = Gesture.Simultaneous(
    Gesture.Exclusive(doubleTap, tap),
    pinch,
    pan
  );

  const rStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector
      gesture={composed}
      simultaneousHandlers={simultaneousHandlers}
    >
      <View style={styles.fill} onLayout={onLayout}>
        <Animated.View style={[styles.fill, rStyle]}>
          <Image source={source} style={styles.fill} contentFit={contentFit} />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fill: { width: "100%", height: "100%" },
});
