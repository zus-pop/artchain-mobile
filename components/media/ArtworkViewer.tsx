import { Image } from "expo-image";
import React, { useCallback, useEffect, useState } from "react";
import {
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type Props = {
  visible: boolean;
  onClose: () => void;
  uri: string;
  initialScale?: number;
  maxScale?: number;
  doubleTapScale?: number;
  backgroundColor?: string;
};

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);
const isFiniteNum = (n: number) => Number.isFinite(n) && !Number.isNaN(n);

export default function ArtworkViewer({
  visible,
  onClose,
  uri,
  initialScale = 1,
  maxScale = 4,
  doubleTapScale = 2,
  backgroundColor = "black",
}: Props) {
  const [cw, setCw] = useState(0);
  const [ch, setCh] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCw(width || 0);
    setCh(height || 0);
  };

  // Transform state
  const scale = useSharedValue(initialScale);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  // background dim for swipe-to-dismiss
  const bg = useSharedValue(1);

  const reset = useCallback(() => {
    scale.value = withTiming(1, { duration: 120 });
    tx.value = withTiming(0, { duration: 120 });
    ty.value = withTiming(0, { duration: 120 });
    bg.value = withTiming(1, { duration: 120 });
  }, [bg, scale, tx, ty]);

  useEffect(() => {
    if (!visible) reset();
  }, [visible, reset]);

  // Double-tap zoom quanh điểm tap
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      if (!cw || !ch) return;
      const next = Math.abs(scale.value - 1) < 0.01 ? clamp(doubleTapScale, 1, maxScale) : 1;

      const cx = e.x - cw / 2;
      const cy = e.y - ch / 2;
      const ratio = next / scale.value;

      const nextTx = (tx.value - cx) * ratio + cx;
      const nextTy = (ty.value - cy) * ratio + cy;

      if (!isFiniteNum(nextTx) || !isFiniteNum(nextTy) || !isFiniteNum(next)) return;

      tx.value = withSpring(nextTx, { damping: 15, stiffness: 200 });
      ty.value = withSpring(nextTy, { damping: 15, stiffness: 200 });
      scale.value = withSpring(next, { damping: 15, stiffness: 200 });
    });

  // Pinch với context ổn định
  type PinchCtx = { startScale: number; startX: number; startY: number };
  const pinch = Gesture.Pinch()
    .onStart((_, ctx: PinchCtx) => {
      ctx.startScale = scale.value;
      ctx.startX = tx.value;
      ctx.startY = ty.value;
    })
    .onUpdate((e, ctx: PinchCtx) => {
      if (!cw || !ch) return;

      // scale mới dựa trên startScale
      const s = clamp(ctx.startScale * e.scale, 1, maxScale);

      // zoom quanh focal point -> cần offset theo tỉ lệ mới so với cũ
      const fx = e.focalX - cw / 2;
      const fy = e.focalY - ch / 2;

      // vị trí mới dựa trên startX/startY (tránh cộng dồn sai)
      const prevS = scale.value || 1;
      const ratio = s / prevS;

      let nx = (ctx.startX - fx) * ratio + fx;
      let ny = (ctx.startY - fy) * ratio + fy;

      if (!isFiniteNum(nx) || !isFiniteNum(ny) || !isFiniteNum(s)) return;

      tx.value = nx;
      ty.value = ny;
      scale.value = s;
    })
    .onEnd(() => {
      clampTranslation(true);
    });

  // Pan với context (startX/startY)
  type PanCtx = { startX: number; startY: number };
  const pan = Gesture.Pan()
    .onStart((_, ctx: PanCtx) => {
      ctx.startX = tx.value;
      ctx.startY = ty.value;
    })
    .onUpdate((e, ctx: PanCtx) => {
      if (!cw || !ch) return;

      if (scale.value <= 1.02) {
        const dy = e.translationY;
        ty.value = dy; // chỉ dọc để dismiss
        bg.value = interpolate(Math.abs(dy), [0, 120], [1, 0.2], Extrapolation.CLAMP);
        return;
      }

      // pan ảnh khi đang zoom
      let nx = ctx.startX + e.translationX;
      let ny = ctx.startY + e.translationY;

      if (!isFiniteNum(nx) || !isFiniteNum(ny)) return;

      tx.value = nx;
      ty.value = ny;
    })
    .onEnd((e) => {
      if (scale.value <= 1.02) {
        const velocityY = e.velocityY ?? 0;
        const distance = Math.abs(ty.value);
        const shouldClose = distance > 140 || Math.abs(velocityY) > 1200;
        if (shouldClose) {
          runOnJS(onClose)();
          return;
        }
        ty.value = withSpring(0);
        bg.value = withTiming(1);
        return;
      }
      clampTranslation(true);
    })
    .simultaneousWithExternalGesture(pinch);

  // Single tap đóng khi scale≈1
  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(180)
    .onEnd(() => {
      if (scale.value <= 1.02) runOnJS(onClose)();
    })
    .requireExternalGestureToFail(doubleTap);

  // Tổ hợp gesture ổn định
  const composed = Gesture.Simultaneous(
    Gesture.Exclusive(doubleTap, singleTap),
    Gesture.Simultaneous(pinch, pan)
  );

  function clampTranslation(animated = false) {
    "worklet";
    if (!cw || !ch) return;

    const s = scale.value || 1;
    const maxOffsetX = Math.max(0, (cw * s - cw) / 2);
    const maxOffsetY = Math.max(0, (ch * s - ch) / 2);

    const nextX = clamp(tx.value, -maxOffsetX, maxOffsetX);
    const nextY = clamp(ty.value, -maxOffsetY, maxOffsetY);

    if (animated) {
      tx.value = withSpring(nextX, { damping: 15, stiffness: 200 });
      ty.value = withSpring(nextY, { damping: 15, stiffness: 200 });
    } else {
      tx.value = nextX;
      ty.value = nextY;
    }

    if (s < 1) scale.value = withSpring(1);
    if (s > maxScale) {
      const ratio = maxScale / s;
      tx.value = withSpring(tx.value * ratio);
      ty.value = withSpring(ty.value * ratio);
      scale.value = withSpring(maxScale);
    }
  }

  const imgStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({ opacity: bg.value }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.container, { backgroundColor }]} onLayout={onLayout}>
        {Platform.OS === "android" && <StatusBar hidden />}
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle, { backgroundColor }]} />

        {/* Tap nền đen để đóng khi scale≈1 */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            if (scale.value <= 1.02) runOnJS(onClose)();
          }}
        />

        <GestureDetector gesture={composed}>
          <Animated.View style={styles.center} collapsable={false}>
            <Animated.View style={imgStyle}>
              <Pressable onPress={() => { /* swallow */ }}>
                <Image
                  source={{ uri }}
                  contentFit="contain"
                  style={{ width: cw || 1, height: ch || 1 }}
                  recyclingKey={uri}
                />
              </Pressable>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
