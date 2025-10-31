// app/painting-evaluation-round1.tsx
import { useWhoAmI } from "@/apis/auth";
import { useEvaluationPaintingRound1 } from "@/apis/painting";
import BrushButton from "@/components/buttons/BrushButton";
import EvaluationSubmitModal from "@/components/modals/EvaluationSubmitModal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Zoomable } from "@likashefqet/react-native-image-zoom";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Animated,
  ColorValue,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { toast } from "sonner-native";
import { z } from "zod";

// NEW: card tách riêng
import PaintingInfoCard from "@/components/cards/PaintingInfoCard";

/* ---------- Color helpers ---------- */
const POOLS: [string, string][] = [
  ["#FF6B6B", "#FFD166"],
  ["#06B6D4", "#3B82F6"],
  ["#22C55E", "#A3E635"],
  ["#F472B6", "#A78BFA"],
  ["#F59E0B", "#F97316"],
  ["#14B8A6", "#84CC16"],
  ["#60A5FA", "#F472B6"],
  ["#F43F5E", "#FB7185"],
];
const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const pickGrad = (seed?: string): [string, string] =>
  POOLS[hashStr(seed || Math.random().toString()) % POOLS.length];

/* ---------- Zoom modal (FULL) ---------- */
function ZoomModal({
  visible,
  uri,
  onClose,
  minScale = 1,
  maxScale = 6,
  doubleTapScale = 2.5,
}: {
  visible: boolean;
  uri: string;
  onClose: () => void;
  minScale?: number;
  maxScale?: number;
  doubleTapScale?: number;
}) {
  return (
    <AnimatedModal
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      hardwareAccelerated
      transparent={false}
    >
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
        <Zoomable
          minScale={minScale}
          maxScale={maxScale}
          doubleTapScale={doubleTapScale}
          isDoubleTapEnabled
          style={{ flex: 1 }}
        >
          <Image
            source={{ uri }}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
          />
        </Zoomable>
        <Pressable
          onPress={onClose}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 48,
          }}
        />
      </GestureHandlerRootView>
    </AnimatedModal>
  );
}
const AnimatedModal = (props: any) => <Modal {...props} />;

/* ---------- Schema ---------- */
const evaluationSchema = z.object({ isPassed: z.boolean() });
type EvaluationFormData = z.infer<typeof evaluationSchema>;

const PressableScale: React.FC<
  React.PropsWithChildren<{
    onPress?: () => void;
    style?: any;
    disabled?: boolean;
  }>
> = ({ children, onPress, style, disabled }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      friction: 5,
      tension: 150,
    }).start();
  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => !disabled && animate(0.96)}
      onPressOut={() => animate(1)}
      onPress={onPress}
      style={({ pressed }) => [
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
        style,
      ]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function PaintingEvaluationRound1Screen() {
  const { paintingTitle, artistName, contestTitle, imageUrl, paintingId } =
    useLocalSearchParams<{
      paintingId: string;
      contestTitle: string;
      paintingTitle: string;
      artistName: string;
      imageUrl: string;
    }>();

  const scheme = useColorScheme();
  const colors = Colors[scheme ?? "light"];
  const glassBg =
    scheme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const glassBgStrong =
    scheme === "dark" ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.06)";

  const {
    control,
    handleSubmit,
    getValues,
    formState: { isValid },
  } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: { isPassed: true },
    mode: "all",
  });

  const { data: examiner } = useWhoAmI();
  const { mutate, isPending } = useEvaluationPaintingRound1();

  const [viewerOpen, setViewerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleBack = () => router.back();

  const onConfirmSubmit = (data: EvaluationFormData) => {
    if (!examiner) return toast.info("Không có thông tin giám khảo");
    if (examiner.role !== "EXAMINER")
      return toast.info("Người dùng đăng nhập không phải giám khảo chấm thi");
    mutate(
      {
        examinerId: examiner.userId,
        paintingId: paintingId,
        isPassed: data.isPassed,
      },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setSuccessOpen(true);
        },
      }
    );
  };
  const onSubmit = () => setConfirmOpen(true);

  const gradientColors = (
    scheme === "dark"
      ? ["#1b1b2f", "#162447", "#1f4068", "#53354a"]
      : ["#a1c4fd", "#c2e9fb", "#fbc2eb", "#a6c0fe"]
  ) as [ColorValue, ColorValue, ...ColorValue[]];
  const [g0, g1] = pickGrad(String(paintingId) + String(paintingTitle));

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={[g0 + "33", g1 + "22"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={orb.orbTL}
      />
      <LinearGradient
        colors={["#fda4af33", "#fde68a33"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={orb.orbBR}
      />

      <ThemedView
        style={[styles(colors).container, { backgroundColor: "transparent" }]}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          {/* Header */}
          <View
            style={[styles(colors).header, { backgroundColor: glassBgStrong }]}
          >
            <PressableScale
              onPress={handleBack}
              style={styles(colors).circleBtn}
            >
              <Ionicons name="chevron-back" size={18} color={colors.primary} />
            </PressableScale>
            <ThemedText style={styles(colors).headerTitle}>
              Đánh giá Vòng 1
            </ThemedText>
            <View style={styles(colors).headerRight} />
          </View>

          {/* Content */}
          <ScrollView
            contentContainerStyle={[
              styles(colors).scrollContent,
              { paddingBottom: 28 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles(colors).section}>
              {/* dùng component mới */}
              <PaintingInfoCard
                C={{
                  card: colors.card,
                  foreground: colors.foreground,
                  mutedForeground: colors.mutedForeground,
                  border: colors.border,
                }}
                scheme={(scheme ?? "light") as "light" | "dark"}
                paintingTitle={paintingTitle}
                artistName={String(artistName)}
                title={contestTitle}
                imageUrl={String(imageUrl)}
                accentHex={String(paintingId) + String(paintingTitle)}
                onPress={() => setViewerOpen(true)}
              />
            </View>

            <View
              style={[
                styles(colors).card,
                styles(colors).section,
                { backgroundColor: glassBg },
              ]}
            >
              <ThemedText type="subtitle" style={styles(colors).sectionTitle}>
                Kết quả đánh giá
              </ThemedText>

              <View style={styles(colors).passFailRow}>
                <Controller
                  control={control}
                  name="isPassed"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <PressableScale
                        onPress={() => onChange(true)}
                        style={[
                          styles(colors).passFailBtn,
                          value === true && styles(colors).passFailBtnActive,
                        ]}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={value === true ? "#fff" : colors.primary}
                        />
                        <ThemedText
                          style={[
                            styles(colors).passFailText,
                            value === true && styles(colors).passFailTextActive,
                          ]}
                        >
                          ĐẠT
                        </ThemedText>
                      </PressableScale>

                      <PressableScale
                        onPress={() => onChange(false)}
                        style={[
                          styles(colors).passFailBtn,
                          value === false && styles(colors).passFailBtnActive,
                        ]}
                      >
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color={value === false ? "#fff" : colors.destructive}
                        />
                        <ThemedText
                          style={[
                            styles(colors).passFailText,
                            value === false &&
                              styles(colors).passFailTextActive,
                          ]}
                        >
                          KHÔNG ĐẠT
                        </ThemedText>
                      </PressableScale>
                    </>
                  )}
                />
              </View>
            </View>

            <View
              style={{ alignItems: "center", marginTop: 6, marginBottom: 36 }}
            >
              <View style={{ width: 230 }}>
                <BrushButton
                  title={isPending ? "Đang gửi..." : "Nộp đánh giá"}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isPending || !isValid}
                  palette="pastel"
                  size="md"
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Modals */}
        <ZoomModal
          visible={viewerOpen}
          onClose={() => setViewerOpen(false)}
          uri={String(imageUrl)}
          minScale={1}
          maxScale={6}
          doubleTapScale={2.5}
        />
        <EvaluationSubmitModal
          visible={confirmOpen}
          variant="confirm"
          title="Gửi đánh giá?"
          subtitle={`Xác nhận nộp kết quả đánh giá cho bài "${paintingTitle}".`}
          primaryText={isPending ? "Đang gửi..." : "Gửi"}
          secondaryText="Huỷ"
          loading={isPending}
          onSecondary={() => setConfirmOpen(false)}
          onPrimary={() =>
            onConfirmSubmit({ isPassed: getValues("isPassed")! })
          }
          onDismiss={() => setConfirmOpen(false)}
        />
        <EvaluationSubmitModal
          visible={successOpen}
          variant="success"
          title="Đã gửi đánh giá"
          subtitle="Cảm ơn bạn! Bài chấm đã được ghi nhận."
          primaryText="Tiếp tục"
          onPrimary={() => {
            setSuccessOpen(false);
            router.back();
          }}
          onDismiss={() => {
            setSuccessOpen(false);
            router.back();
          }}
        />
      </ThemedView>
    </View>
  );
}

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingVertical: 14,
      paddingTop: Platform.OS === "ios" ? 52 : 18,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 10,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "900",
      color: colors.foreground,
      flex: 1,
      textAlign: "center",
      letterSpacing: 0.4,
    },
    headerRight: { width: 48, alignItems: "flex-end" },
    circleBtn: {
      width: 36,
      height: 36,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },

    scrollContent: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 12 },
    section: { marginBottom: 16 },

    // (đã loại bỏ các style card cũ: frameWrap/frameBorder/paintingCard/... vì đã move vào component)
    card: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      backgroundColor: "transparent",
    },
    sectionTitle: {
      marginBottom: 12,
      color: colors.foreground,
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 0.3,
    },

    passFailRow: { flexDirection: "row", gap: 16, marginBottom: 12 },
    passFailBtn: {
      flex: 1,
      borderRadius: 16,
      paddingVertical: 20,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    passFailBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    passFailText: { fontSize: 16, fontWeight: "900", color: colors.foreground },
    passFailTextActive: { color: "#fff" },
  });

const orb = StyleSheet.create({
  orbTL: {
    position: "absolute",
    top: 0,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 160,
    transform: [{ rotate: "25deg" }],
    opacity: 0.9,
  },
  orbBR: {
    position: "absolute",
    bottom: -20,
    left: -60,
    width: 300,
    height: 300,
    borderRadius: 180,
    transform: [{ rotate: "-15deg" }],
    opacity: 0.7,
  },
});
