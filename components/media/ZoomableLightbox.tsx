// ZoomableLightbox.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  source: { uri: string } | number;
  thumbnailStyle?: any;
  borderRadius?: number;
  enableLightbox?: boolean;
  maxScale?: number;
  controlColor?: string;
  showHint?: boolean;
};

export default function ZoomableLightbox({
  source,
  thumbnailStyle,
  borderRadius = 14,
  enableLightbox = true,
  maxScale = 4,
  controlColor = "#fff",
  showHint = true,
}: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => enableLightbox && setVisible(true)}
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
      >
        <Image
          source={source}
          style={[{ width: "100%", height: 260, borderRadius }, thumbnailStyle]}
          contentFit="cover"
          transition={200}
        />
      </Pressable>

      <Modal
        visible={visible}
        presentationStyle="fullScreen"
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <StatusBar hidden animated />
        <LightboxContent
          source={source}
          onClose={() => setVisible(false)}
          maxScale={maxScale}
          controlColor={controlColor}
          showHint={showHint}
        />
      </Modal>
    </>
  );
}

/* =================== Lightbox Content (Reanimated + Gesture Handler) =================== */

function LightboxContent({
  source,
  onClose,
  maxScale,
  controlColor,
  showHint,
}: {
  source: { uri: string } | number;
  onClose: () => void;
  maxScale: number;
  controlColor: string;
  showHint: boolean;
}) {
  const { width: vw, height: vh } = useWindowDimensions();

  // transforms
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const rot = useSharedValue(0); // deg

  const savedScale = useSharedValue(1);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);

  // UI visible
  const [uiVisible, setUiVisible] = useState(true);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n));

  const boundsFor = useCallback(
    (s: number) => {
      if (s <= 1) return { x: 0, y: 0 };
      const extraW = (vw * s - vw) / 2;
      const extraH = (vh * s - vh) / 2;
      return { x: extraW, y: extraH };
    },
    [vw, vh]
  );

  const bumpUiAndAutoHide = useCallback(() => {
    setUiVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setUiVisible(false), 2000);
  }, []);
  useEffect(() => {
    bumpUiAndAutoHide();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [bumpUiAndAutoHide]);

  /* Gestures */

  // Single tap => toggle UI (hoặc hiển thị + auto-hide lại)
  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .maxDeltaX(6)
    .maxDeltaY(6)
    .onEnd((_e, success) => {
      if (!success) return;
      runOnJS(setUiVisible)((v) => {
        // nếu đang ẩn => hiện + auto-hide
        if (!v) {
          bumpUiAndAutoHide();
          return true;
        }
        // nếu đang hiện => ẩn ngay
        return false;
      });
    });

  // Double tap => zoom vào đúng điểm chạm
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart((e) => {
      const target = scale.value > 1 ? 1 : 2;
      const ratio = target / scale.value;

      // Dịch chuyển để giữ điểm chạm "ở nguyên" vị trí tương đối sau zoom
      const dx = (e.x - vw / 2) * (1 - ratio);
      const dy = (e.y - vh / 2) * (1 - ratio);

      scale.value = withTiming(target, { duration: 180 });
      tx.value = withTiming(tx.value + dx, { duration: 180 });
      ty.value = withTiming(ty.value + dy, { duration: 180 });

      runOnJS(bumpUiAndAutoHide)();
    });

  // Pinch với focal point
  const pinch = Gesture.Pinch()
    .onBegin(() => {
      savedScale.value = scale.value;
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    })
    .onUpdate((e) => {
      const next = clamp(savedScale.value * e.scale, 1, maxScale);
      const ratio = next / savedScale.value;

      // Điều chỉnh theo focal
      const dx = (e.focalX - vw / 2) * (1 - ratio);
      const dy = (e.focalY - vh / 2) * (1 - ratio);

      const b = boundsFor(next);
      scale.value = next;
      tx.value = clamp(savedTx.value + dx, -b.x, b.x);
      ty.value = clamp(savedTy.value + dy, -b.y, b.y);
    })
    .onEnd(() => {
      runOnJS(bumpUiAndAutoHide)();
    });

  // Pan khi đã zoom
  const pan = Gesture.Pan()
    .onBegin(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    })
    .onUpdate((e) => {
      if (scale.value <= 1) return;
      const b = boundsFor(scale.value);
      tx.value = clamp(savedTx.value + e.translationX, -b.x, b.x);
      ty.value = clamp(savedTy.value + e.translationY, -b.y, b.y);
    })
    .onEnd(() => {
      runOnJS(bumpUiAndAutoHide)();
    });

  // Swipe-down để đóng (khi scale=1)
  const swipeToClose = Gesture.Pan()
    .activeOffsetY(12)
    .onEnd((e) => {
      if (scale.value > 1) return;
      // Vuốt mạnh xuống hoặc kéo đủ xa thì đóng
      if (e.translationY > 120 || e.velocityY > 800) {
        runOnJS(onClose)();
      }
    });

  const composed = Gesture.Simultaneous(
    Gesture.Exclusive(doubleTap, singleTap),
    pinch,
    pan,
    swipeToClose
  );

  /* Anim styles */
  const rImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
      { rotate: `${rot.value}deg` },
    ],
  }));

  const close = useCallback(() => onClose(), [onClose]);

  const rotateLeft = () => {
    rot.value = (rot.value - 90 + 360) % 360;
    bumpUiAndAutoHide();
  };
  const rotateRight = () => {
    rot.value = (rot.value + 90) % 360;
    bumpUiAndAutoHide();
  };
  const zoomIn = () => {
    scale.value = withTiming(clamp(scale.value + 0.25, 1, maxScale));
    bumpUiAndAutoHide();
  };
  const zoomOut = () => {
    scale.value = withTiming(clamp(scale.value - 0.25, 1, maxScale));
    bumpUiAndAutoHide();
  };
  const reset = () => {
    scale.value = withTiming(1);
    tx.value = withTiming(0);
    ty.value = withTiming(0);
    rot.value = withTiming(0);
    bumpUiAndAutoHide();
  };

  return (
    <View style={styles.backdrop}>
      {/* Stage (edge-to-edge) */}
      <GestureDetector gesture={composed}>
        <Animated.View style={styles.stage}>
          <Animated.View style={[styles.imageWrap, rImageStyle]}>
            <Image
              source={source}
              style={styles.imageFill}
              contentFit="contain"
            />
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {/* TOP controls */}
      <View
        style={[
          styles.topRow,
          {
            opacity: uiVisible ? 1 : 0,
            pointerEvents: uiVisible ? "auto" : "none",
          },
        ]}
      >
        <Pressable onPress={close} style={styles.circleBtn} hitSlop={10}>
          <Ionicons name="close" size={22} color={controlColor} />
        </Pressable>
      </View>

      {/* Bottom toolbar */}
      <View
        style={[
          styles.bottomBarWrap,
          {
            opacity: uiVisible ? 1 : 0,
            pointerEvents: uiVisible ? "auto" : "none",
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.bottomBar}>
          <IconBtn
            icon="reload-outline"
            onPress={rotateLeft}
            color={controlColor}
            mirrored
          />
          <IconBtn
            icon="reload-outline"
            onPress={rotateRight}
            color={controlColor}
          />
          <IconBtn icon="add" onPress={zoomIn} color={controlColor} />
          <IconBtn icon="remove" onPress={zoomOut} color={controlColor} />
          <IconBtn
            icon="refresh-outline"
            onPress={reset}
            color={controlColor}
          />
        </View>
        {showHint && (
          <Text style={styles.hint}>
            Pinch để zoom • Kéo để di chuyển • Double-tap để phóng/thu • Vuốt
            xuống để đóng
          </Text>
        )}
      </View>

      {/* Gradients chỉ khi UI hiện */}
      {uiVisible && <View pointerEvents="none" style={styles.topGradient} />}
      {uiVisible && <View pointerEvents="none" style={styles.bottomGradient} />}
    </View>
  );
}

/* =================== UI bits =================== */

function IconBtn({
  icon,
  onPress,
  color,
  mirrored,
}: {
  icon: any;
  onPress: () => void;
  color: string;
  mirrored?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.circleBtn} hitSlop={10}>
      <Ionicons
        name={icon}
        size={20}
        color={color}
        style={mirrored ? { transform: [{ scaleX: -1 }] } : undefined}
      />
    </Pressable>
  );
}

/* =================== Styles =================== */

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#000" },
  stage: { flex: 1, justifyContent: "center", alignItems: "center" },
  imageWrap: { width: "100%", height: "100%" },
  imageFill: { width: "100%", height: "100%" },

  topRow: {
    position: "absolute",
    top: Platform.select({ ios: 54, android: 28 }),
    right: 16,
    zIndex: 10,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },

  bottomBarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: Platform.select({ ios: 28, android: 18 }),
    alignItems: "center",
    zIndex: 9,
  },
  bottomBar: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    alignItems: "center",
  },
  hint: {
    marginTop: 10,
    color: "#e5e7eb",
    fontSize: 12,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 1 },
  },

  topGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 140,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  bottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
});
