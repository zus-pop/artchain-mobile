import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import ZoomPanView from "./ZoomPanView";

export type ReviewImage = { uri: string } | number;

type Props = {
  images: ReviewImage[];
  visible: boolean;
  initialIndex?: number;
  onClose: () => void;
  onSubmit?: (payload: {
    index: number;
    image: ReviewImage;
    approved: boolean;
    note: string;
    rotationDeg: number;
  }) => void;
  controlColor?: string;
  maxScale?: number;
};

export default function ImageReview({
  images,
  visible,
  initialIndex = 0,
  onClose,
  onSubmit,
  controlColor = "#fff",
  maxScale = 4,
}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [uiVisible, setUiVisible] = useState(true);
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const rotations = useMemo(() => images.map(() => 0), [images.length]);
  const [rotMap, setRotMap] = useState<number[]>(rotations);

  const animUi = useSharedValue(uiVisible ? 1 : 0);
  const uiStyle = useAnimatedStyle(() => ({
    opacity: withTiming(animUi.value, { duration: 120 }),
  }));

  const toggleUI = () => {
    setUiVisible((v) => {
      const next = !v;
      animUi.value = next ? 1 : 0;
      return next;
    });
  };

  const rotateLeft = () =>
    setRotMap((arr) =>
      arr.map((d, i) => (i === index ? (d - 90 + 360) % 360 : d))
    );
  const rotateRight = () =>
    setRotMap((arr) => arr.map((d, i) => (i === index ? (d + 90) % 360 : d)));

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(images.length - 1, i + 1));

  const current = images[index];
  const rotationDeg = rotMap[index] || 0;

  const rotateStyle = useAnimatedStyle(
    () => ({ transform: [{ rotate: `${rotationDeg}deg` }] }),
    [rotationDeg]
  );

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
      presentationStyle="fullScreen"
      transparent={false}
    >
      {/* RẤT QUAN TRỌNG CHO ANDROID: bọc GestureHandlerRootView để tránh màn đen */}
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
        <View style={s.root}>
          {/* Stage: chạm 1 lần -> toggle UI, pinch/pan/double-tap nằm trong ZoomPanView */}
          <View style={s.stage}>
            <Animated.View style={[s.fill, rotateStyle]}>
              <ZoomPanView
                source={current}
                maxScale={maxScale}
                onSingleTap={toggleUI}
              />
            </Animated.View>
          </View>

          {/* TOP BAR */}
          <Animated.View
            style={[
              s.topBar,
              uiStyle,
              { pointerEvents: uiVisible ? "auto" : "none" },
            ]}
          >
            <Pressable onPress={onClose} style={s.circleBtn} hitSlop={10}>
              <Ionicons name="close" size={22} color={controlColor} />
            </Pressable>

            <View style={s.counter}>
              <Text style={s.counterTxt}>
                {index + 1} / {images.length}
              </Text>
            </View>

            <View style={{ width: 40 }} />
          </Animated.View>

          {/* BOTTOM TOOLBAR */}
          <Animated.View
            style={[
              s.bottomWrap,
              uiStyle,
              { pointerEvents: uiVisible ? "auto" : "none" },
            ]}
          >
            <View style={s.toolbarRow}>
              <ToolbarButton
                icon="chevron-back"
                onPress={goPrev}
                disabled={index === 0}
              />
              <ToolbarButton icon="reload-outline" onPress={rotateLeft} />
              <ToolbarButton
                icon="reload-outline"
                onPress={rotateRight}
                mirrored
              />
              <ToolbarButton
                icon="create-outline"
                onPress={() => setNoteOpen(true)}
                long
                label="Ghi chú"
              />
              <ToolbarButton
                icon="close-circle-outline"
                onPress={() =>
                  onSubmit?.({
                    index,
                    image: current,
                    approved: false,
                    note,
                    rotationDeg,
                  })
                }
                long
                label="Từ chối"
              />
              <ToolbarButton
                icon="checkmark-circle-outline"
                onPress={() =>
                  onSubmit?.({
                    index,
                    image: current,
                    approved: true,
                    note,
                    rotationDeg,
                  })
                }
                long
                label="Duyệt"
              />
              <ToolbarButton
                icon="chevron-forward"
                onPress={goNext}
                disabled={index === images.length - 1}
              />
            </View>

            {note ? (
              <View style={s.notePill}>
                <Ionicons name="document-text-outline" size={14} color="#fff" />
                <Text style={s.notePillTxt} numberOfLines={1}>
                  {note}
                </Text>
              </View>
            ) : null}
          </Animated.View>

          {/* Info badge (mẫu) */}
          <Animated.View style={[s.infoBadge, uiStyle]}>
            <Image
              source={current}
              style={s.thumb}
              contentFit="cover"
              transition={150}
            />
            <Text style={s.infoTxt}>Đang xem ảnh {index + 1}</Text>
          </Animated.View>

          {/* NOTE SHEET đơn giản */}
          {noteOpen && (
            <View style={s.noteSheetBackdrop}>
              <View style={s.noteSheet}>
                <Text style={s.noteTitle}>Ghi chú cho ảnh {index + 1}</Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Nhập ghi chú…"
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={4}
                  style={s.noteInput}
                  textAlignVertical="top"
                />
                <View style={s.noteActions}>
                  <Pressable
                    style={[s.sheetBtn, { backgroundColor: "#0ea5e9" }]}
                    onPress={() => setNoteOpen(false)}
                  >
                    <Text style={s.sheetBtnTxt}>Xong</Text>
                  </Pressable>
                  <Pressable
                    style={[s.sheetBtn, { backgroundColor: "#ef4444" }]}
                    onPress={() => {
                      setNote("");
                      setNoteOpen(false);
                    }}
                  >
                    <Text style={s.sheetBtnTxt}>Xoá</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

/* Small button */
function ToolbarButton({
  icon,
  onPress,
  disabled,
  mirrored,
  long,
  label,
}: {
  icon: any;
  onPress: () => void;
  disabled?: boolean;
  mirrored?: boolean;
  long?: boolean;
  label?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.toolBtn,
        long && s.toolBtnLong,
        disabled && { opacity: 0.4 },
        pressed && { opacity: 0.85 },
      ]}
      hitSlop={10}
    >
      <Ionicons
        name={icon}
        size={20}
        color="#fff"
        style={mirrored ? { transform: [{ scaleX: -1 }] } : undefined}
      />
      {long && !!label && <Text style={s.toolLabel}>{label}</Text>}
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  stage: { flex: 1 },
  fill: { width: "100%", height: "100%" },

  topBar: {
    position: "absolute",
    top: Platform.select({ ios: 50, android: 20 }),
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  counterTxt: { color: "#fff", fontWeight: "800" },

  bottomWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: Platform.select({ ios: 24, android: 16 }),
    alignItems: "center",
    zIndex: 20,
  },
  toolbarRow: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  toolBtn: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  toolBtnLong: { paddingHorizontal: 14 },
  toolLabel: { color: "#fff", fontWeight: "800", fontSize: 12 },

  infoBadge: {
    position: "absolute",
    top: Platform.select({ ios: 50, android: 20 }),
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 19,
  },
  thumb: { width: 28, height: 28, borderRadius: 6, backgroundColor: "#111" },
  infoTxt: { color: "#fff", fontWeight: "800" },

  notePill: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  notePillTxt: { color: "#fff", maxWidth: 240, fontWeight: "700" },

  noteSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  noteSheet: {
    backgroundColor: "#0b1220",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 12,
  },
  noteTitle: { color: "#fff", fontWeight: "900", fontSize: 16 },
  noteInput: {
    minHeight: 100,
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#0f172a",
    color: "#e5e7eb",
  },
  noteActions: { flexDirection: "row", gap: 10, justifyContent: "flex-end" },
  sheetBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  sheetBtnTxt: { color: "#fff", fontWeight: "800" },
});
