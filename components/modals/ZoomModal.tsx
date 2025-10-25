import { Ionicons } from "@expo/vector-icons";
import { Zoomable } from "@likashefqet/react-native-image-zoom";
import { Image as ExpoImage } from "expo-image";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  uri: string;
  onClose: () => void;
  minScale?: number;
  maxScale?: number;
  doubleTapScale?: number;
};

export default function ZoomModal({
  visible,
  uri,
  onClose,
  minScale = 1,
  maxScale = 6,
  doubleTapScale = 2.5,
}: Props) {
  const insets = useSafeAreaInsets();

  // Hiện/ẩn nút X khi chạm nhẹ
  const [showClose, setShowClose] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const revealCloseTemporarily = () => {
    setShowClose(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowClose(false), 1500);
  };

  useEffect(() => {
    // Khi mở modal, hiện X một chút rồi ẩn
    if (visible) revealCloseTemporarily();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [visible]);

  // Tap nhẹ không cản trở pinch/zoom
  const tap = Gesture.Tap()
    .maxDuration(180)
    .numberOfTaps(1)
    .onEnd((_e, success) => {
      if (success) revealCloseTemporarily();
    });

  // Mở khoá xoay khi mở modal, khôi phục khi đóng
  const prevLockRef = useRef<ScreenOrientation.OrientationLock | null>(null);
  useEffect(() => {
    (async () => {
      if (visible) {
        try {
          prevLockRef.current =
            await ScreenOrientation.getOrientationLockAsync();
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.ALL
          );
        } catch {}
      } else {
        try {
          await ScreenOrientation.lockAsync(
            prevLockRef.current ?? ScreenOrientation.OrientationLock.PORTRAIT_UP
          );
        } catch {}
      }
    })();
    return () => {
      (async () => {
        try {
          await ScreenOrientation.lockAsync(
            prevLockRef.current ?? ScreenOrientation.OrientationLock.PORTRAIT_UP
          );
        } catch {}
      })();
    };
  }, [visible]);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
      presentationStyle="fullScreen" // iOS full-screen thật sự
      statusBarTranslucent // Android: phủ dưới status bar
      hardwareAccelerated
      transparent={false} // Nền modal không trong suốt
      supportedOrientations={[
        "portrait",
        "landscape",
        "landscape-left",
        "landscape-right",
      ]}
    >
      {/* NỀN ĐEN che full màn hình */}
      <GestureHandlerRootView style={styles.root}>
        {/* Bọc toàn bộ Zoomable bằng Tap detector để nghe “chạm nhẹ” */}
        <GestureDetector gesture={tap}>
          <Zoomable
            minScale={minScale}
            maxScale={maxScale}
            doubleTapScale={doubleTapScale}
            isDoubleTapEnabled
            style={styles.fill}
          >
            <ExpoImage
              source={{ uri }}
              style={styles.fill}
              contentFit="contain"
            />
          </Zoomable>
        </GestureDetector>

        {/* Nút ĐÓNG (hiện khi tap nhẹ, tự ẩn sau 1.5s) */}
        {showClose && (
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Đóng xem ảnh"
            style={[
              styles.closeBtn,
              {
                top: insets.top + 8,
                right: insets.right + 12,
              },
            ]}
            hitSlop={10}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  fill: { width: "100%", height: "100%" },
  closeBtn: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
});
