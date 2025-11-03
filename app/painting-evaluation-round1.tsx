// app/.../PaintingEvaluationScreen.tsx
import BrushButton from "@/components/buttons/BrushButton";
// import ArtworkViewer from "@/components/media/ArtworkViewer"; // <- bỏ
import EvaluationSubmitModal from "@/components/modals/EvaluationSubmitModal"; // <-- NEW
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ExpoImage, Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { toast } from "sonner-native";
import { z } from "zod";
import { useWhoAmI } from "../apis/auth";
import { useEvaluatePaintingRound1 } from "../apis/painting";

import { Zoomable } from "@likashefqet/react-native-image-zoom";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
          <ExpoImage
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

/* --------- Modal wrapper để đồng nhất import React Native <=/>=0.73 --------- */
const AnimatedModal = (props: any) => <Modal {...props} />;

/* ---------- Helpers ---------- */
const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);
const STEP = 1;
const roundToStep = (n: number, step = STEP) => Math.round(n / step) * step;

const FEEDBACK_PRESETS = [
  "Ý tưởng tốt",
  "Bố cục chắc",
  "Màu sắc hài hoà",
  "Thông điệp chưa rõ",
  "Cần trau chuốt chi tiết",
  "Chưa sát chủ đề",
];

const QUICK_FEEDBACK: string[] = [
  "👍 Tác phẩm nổi bật",
  "🎨 Phối màu ấn tượng",
  "🧭 Bố cục cân đối",
  "✨ Điểm nhấn rõ",
  "🧪 Cần thử nghiệm thêm",
  "🧹 Nên tinh gọn chi tiết",
  "🧩 Tỉ lệ cần chỉnh",
  "🌗 Tương phản yếu",
];

/* ---------- Schema ---------- */
const evaluationSchema = z
  .object({
    score: z
      .number({ invalid_type_error: "Điểm phải là số" })
      .min(1, "Điểm phải ít nhất là 1")
      .max(10, "Điểm không được vượt quá 10"),
    feedback: z.string().min(0),
  })
  .superRefine((val, ctx) => {
    if (val.score <= 6 && (!val.feedback || val.feedback.trim().length < 10)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["feedback"],
        message: "Bắt buộc nhập nhận xét tối thiểu 10 ký tự khi điểm ≤ 6",
      });
    }
  });

type EvaluationFormData = z.infer<typeof evaluationSchema>;

/* ---------- Tiny pressable ---------- */
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

export default function PaintingEvaluationScreen() {
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
    setValue,
    watch,
    getValues,
    formState: { errors, isValid, isDirty },
  } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: { score: 5, feedback: "" },
    mode: "all",
  });

  const scoreWatch = watch("score");
  const { data: examiner } = useWhoAmI();
  const { mutate, isPending } = useEvaluatePaintingRound1();

  const [viewerOpen, setViewerOpen] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // NEW: modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleBack = () => {
    if (isDirty) {
      Alert.alert(
        "Bạn có muốn thoát?",
        "Bản nháp đã được lưu tự động, nhưng các thay đổi chưa gửi. Tiếp tục quay lại?",
        [
          { text: "Ở lại", style: "cancel" },
          {
            text: "Quay lại",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
      return;
    }
    router.back();
  };

  /* ---------- Submit flow ---------- */
  const onConfirmSubmit = (data: EvaluationFormData) => {
    if (!examiner) {
      toast.info("Không có thông tin giám khảo");
      return;
    }
    if (examiner.role !== "EXAMINER") {
      toast.info("Người dùng đăng nhập không phải giám khảo chấm thi");
      return;
    }
    mutate(
      {
        examinerId: examiner.userId,
        paintingId: paintingId,
        score: data.score,
        feedback: data.feedback?.trim(),
      },
      {
        onSuccess: async () => {
          setConfirmOpen(false);
        },
      }
    );
  };

  const onSubmit = () => setConfirmOpen(true);

  /* ---------- Score Stepper ---------- */
  const bumpScore = (delta: number) => {
    const cur = Number(getValues("score") ?? 0);
    const next = clamp(roundToStep(cur + delta), 1, 10);
    setValue("score", next, { shouldValidate: true, shouldDirty: true });
  };

  /* ---------- Preset & Quick feedback ---------- */
  const appendPreset = (txt: string) => {
    const cur = getValues("feedback") ?? "";
    const joiner = cur.trim().length ? "; " : "";
    setValue("feedback", `${cur.trim()}${joiner}${txt}`.trim(), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ThemedView
        style={[styles(colors).container, { backgroundColor: "transparent" }]}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          {/* Header kính + nút tròn */}
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
              Đánh giá Tranh
            </ThemedText>
          </View>

          {/* Nội dung */}
          <ScrollView
            contentContainerStyle={[
              styles(colors).scrollContent,
              { paddingBottom: 28 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 1) Ảnh + meta + details */}
            <View style={styles(colors).section}>
              {/* Khung ảnh viền gradient — use app colors */}
              <View style={styles(colors).frameWrap}>
                <LinearGradient
                  colors={[colors.border, colors.border]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles(colors).frameBorder}
                />
                <View style={[styles(colors).paintingCard]}>
                  <PressableScale
                    onPress={() => setViewerOpen(true)}
                    style={{ borderRadius: 14 }}
                  >
                    <Image
                      source={{ uri: String(imageUrl) }}
                      style={styles(colors).paintingImage}
                      placeholder={require("@/assets/images/partial-react-logo.png")}
                      contentFit="cover"
                      transition={150}
                    />
                  </PressableScale>

                  {/* Chi tiết tác phẩm */}
                  <View style={styles(colors).detailsCard}>
                    <View style={styles(colors).detailItem}>
                      <View style={styles(colors).detailIconCircle}>
                        <Ionicons
                          name="color-palette-outline"
                          size={16}
                          color="#fff"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={styles(colors).detailLabel}>
                          Tên tác phẩm
                        </ThemedText>
                        <ThemedText style={styles(colors).detailValue}>
                          {paintingTitle}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles(colors).detailItem}>
                      <View style={styles(colors).detailIconCircle}>
                        <Ionicons
                          name="person-outline"
                          size={16}
                          color="#fff"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={styles(colors).detailLabel}>
                          Tác giả
                        </ThemedText>
                        <ThemedText style={styles(colors).detailValue}>
                          {artistName}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles(colors).detailItem}>
                      <View style={styles(colors).detailIconCircle}>
                        <Ionicons
                          name="trophy-outline"
                          size={16}
                          color="#fff"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={styles(colors).detailLabel}>
                          Cuộc thi
                        </ThemedText>
                        <ThemedText style={styles(colors).detailValue}>
                          {contestTitle}
                        </ThemedText>
                      </View>
                    </View>
                  </View>

                  <View style={styles(colors).microDivider} />
                </View>
              </View>
            </View>

            {/* 2) Điểm số */}
            <View
              style={[
                styles(colors).card,
                styles(colors).section,
                { backgroundColor: glassBg },
              ]}
            >
              <ThemedText type="subtitle" style={styles(colors).sectionTitle}>
                Điểm số
              </ThemedText>

              <View style={styles(colors).scoreRow}>
                <PressableScale
                  onPress={() => bumpScore(-STEP)}
                  style={styles(colors).circleBtnLg}
                >
                  <Ionicons name="remove" size={20} color={colors.primary} />
                </PressableScale>

                <View style={styles(colors).pillBorderWrapWide}>
                  <LinearGradient
                    colors={[colors.border, colors.border]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles(colors).pillBorderWide}
                  />
                  <View
                    style={[
                      styles(colors).scorePill,
                      { backgroundColor: colors.card },
                    ]}
                  >
                    <Ionicons name="star" size={18} color={colors.primary} />
                    <Controller
                      control={control}
                      name="score"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          placeholder="—"
                          value={
                            value === undefined ? "" : Number(value).toString()
                          }
                          onChangeText={(text) => {
                            const t = text.replace(",", ".").trim();
                            if (t === "") {
                              onChange(undefined as any);
                              return;
                            }
                            const n = Number(t);
                            const safe = Number.isFinite(n)
                              ? clamp(roundToStep(n), 1, 10)
                              : 1;
                            onChange(safe);
                          }}
                          keyboardType="numeric"
                          style={styles(colors).scoreInput}
                          placeholderTextColor={colors.mutedForeground}
                        />
                      )}
                    />
                    <ThemedText style={styles(colors).scoreSuffix}>
                      /10
                    </ThemedText>
                  </View>
                </View>

                <PressableScale
                  onPress={() => bumpScore(STEP)}
                  style={styles(colors).circleBtnLg}
                >
                  <Ionicons name="add" size={20} color={colors.primary} />
                </PressableScale>
              </View>

              {typeof scoreWatch === "number" && scoreWatch <= 6 && (
                <ThemedText style={styles(colors).hintText}>
                  Gợi ý: với điểm ≤ 6 cần nhận xét tối thiểu 10 ký tự.
                </ThemedText>
              )}
              {errors.score && (
                <ThemedText style={styles(colors).errorText}>
                  {errors.score.message}
                </ThemedText>
              )}
            </View>

            {/* 3) QUICK FEEDBACK */}
            <View
              style={[
                styles(colors).card,
                styles(colors).section,
                { backgroundColor: glassBg },
              ]}
            >
              <ThemedText type="subtitle" style={styles(colors).sectionTitle}>
                Feedback nhanh
              </ThemedText>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 6 }}
                style={{ marginBottom: 8 }}
              >
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {QUICK_FEEDBACK.map((q, i) => (
                    <PressableScale
                      key={q}
                      onPress={() => appendPreset(q)}
                      style={styles(colors).chipWrap}
                    >
                      <LinearGradient
                        colors={[colors.border, colors.border]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles(colors).chipBorder}
                      />
                      <View
                        style={[
                          styles(colors).chipInner,
                          { backgroundColor: colors.card },
                        ]}
                      >
                        <ThemedText style={styles(colors).chipText}>
                          {q}
                        </ThemedText>
                      </View>
                    </PressableScale>
                  ))}
                </View>
              </ScrollView>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                {["❤️", "👏", "🔥", "🤔", "🛠️"].map((emo, i) => (
                  <PressableScale
                    key={emo}
                    onPress={() => appendPreset(emo)}
                    style={{ borderRadius: 999, overflow: "hidden" }}
                  >
                    <LinearGradient
                      colors={[colors.border, colors.border]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                      }}
                    >
                      <ThemedText style={{ color: "#fff", fontWeight: "800" }}>
                        {emo}
                      </ThemedText>
                    </LinearGradient>
                  </PressableScale>
                ))}
              </View>
            </View>

            {/* 4) Đánh giá chi tiết + presets */}
            <View
              style={[
                styles(colors).card,
                styles(colors).section,
                { backgroundColor: glassBg },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <ThemedText
                  type="subtitle"
                  style={[styles(colors).sectionTitle, { marginBottom: 0 }]}
                >
                  Đánh giá chi tiết
                </ThemedText>
                <PressableScale
                  onPress={() => setShowPresets((v) => !v)}
                  style={styles(colors).circleBtn}
                >
                  <Ionicons
                    name={showPresets ? "close" : "add"}
                    size={16}
                    color={colors.primary}
                  />
                </PressableScale>
              </View>

              {showPresets && (
                <View style={[styles(colors).chipsWrap, { marginBottom: 10 }]}>
                  {FEEDBACK_PRESETS.map((p, idx) => (
                    <PressableScale
                      key={p}
                      onPress={() => appendPreset(p)}
                      style={styles(colors).chipWrap}
                    >
                      <LinearGradient
                        colors={[colors.border, colors.border]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles(colors).chipBorder}
                      />
                      <View
                        style={[
                          styles(colors).chipInner,
                          { backgroundColor: colors.card },
                        ]}
                      >
                        <Ionicons name="add" size={14} color={colors.primary} />
                        <ThemedText style={styles(colors).chipText}>
                          {p}
                        </ThemedText>
                      </View>
                    </PressableScale>
                  ))}
                </View>
              )}

              <View
                style={[
                  styles(colors).textareaContainer,
                  errors.feedback && styles(colors).inputError,
                ]}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={20}
                  color={colors.primary}
                  style={{ marginTop: 16, marginRight: 10 }}
                />
                <Controller
                  control={control}
                  name="feedback"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="Cung cấp đánh giá chi tiết về bức tranh này..."
                      value={value}
                      onChangeText={(t) => {
                        onChange(t);
                      }}
                      multiline
                      numberOfLines={6}
                      style={[
                        styles(colors).textarea,
                        { color: colors.foreground },
                      ]}
                      placeholderTextColor={colors.mutedForeground}
                      textAlignVertical="top"
                    />
                  )}
                />
              </View>
              {errors.feedback && (
                <ThemedText style={styles(colors).errorText}>
                  {errors.feedback.message}
                </ThemedText>
              )}
            </View>

            {/* 5) Submit */}
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

        {/* Viewer */}
        <ZoomModal
          visible={viewerOpen}
          onClose={() => setViewerOpen(false)}
          uri={String(imageUrl)}
          minScale={1}
          maxScale={6}
          doubleTapScale={2.5}
        />

        {/* Confirm — đẹp, gradient, animation */}
        <EvaluationSubmitModal
          visible={confirmOpen}
          variant="confirm"
          title="Gửi đánh giá?"
          subtitle={`Xác nhận nộp điểm và nhận xét cho bài “${paintingTitle}”.`}
          primaryText={isPending ? "Đang gửi..." : "Gửi"}
          secondaryText="Huỷ"
          loading={isPending}
          onSecondary={() => setConfirmOpen(false)}
          onPrimary={() =>
            onConfirmSubmit({
              score: getValues("score")!,
              feedback: getValues("feedback") || "",
            })
          }
          onDismiss={() => setConfirmOpen(false)}
        />

        {/* Success — confetti + gradient */}
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

/* ---------- Styles ---------- */
const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: { flex: 1 },

    /* Header */
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

    /* Circles */
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
    circleBtnLg: {
      width: 44,
      height: 44,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },

    /* Layout */
    scrollContent: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 12 },
    section: { marginBottom: 16 },

    /* Frame + image */
    frameWrap: { position: "relative", borderRadius: 16 },
    frameBorder: {
      position: "absolute",
      inset: 0,
      borderRadius: 16,
      opacity: 0.85,
    },
    paintingCard: {
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 0.8,
      borderColor: "rgba(148, 163, 184, 0.35)",
      position: "relative",
      paddingBottom: 8,
      backgroundColor: colors.card,
    },
    paintingImage: {
      width: "100%",
      height: 280,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },

    /* Details đẹp */
    detailsCard: {
      marginTop: 10,
      marginHorizontal: 12,
      borderRadius: 14,
      borderColor: colors.border,
      padding: 10,
      gap: 10,
    },
    detailItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    detailIconCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOpacity: 0.25,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    detailLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontWeight: "700",
    },
    detailValue: { fontSize: 14, color: colors.foreground, fontWeight: "800" },

    overlayTopRightRow: {
      position: "absolute",
      top: 12,
      right: 12,
      zIndex: 2,
      gap: 8,
      alignItems: "center",
    },

    /* Pill border fake */
    pillBorderWrap: { position: "relative", borderRadius: 999 },
    pillBorder: {
      position: "absolute",
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      borderRadius: 999,
    },
    pillInner: {
      position: "relative",
      margin: 1.5,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    pillText: { fontSize: 12, fontWeight: "800", color: colors.primary },

    paintingMetaRow: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 12,
      paddingTop: 8,
      flexWrap: "wrap",
    },
    metaText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontWeight: "700",
    },
    microDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: "rgba(2, 6, 23, 0.08)",
      marginHorizontal: 12,
      marginTop: 8,
    },

    /* Card shell */
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

    /* Score */
    scoreRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    pillBorderWrapWide: { position: "relative", borderRadius: 16, flex: 1 },
    pillBorderWide: {
      position: "absolute",
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      borderRadius: 16,
    },
    scorePill: {
      position: "relative",
      margin: 1.5,
      borderRadius: 16,
      borderWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingHorizontal: 14,
      minHeight: 56,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
      backgroundColor: colors.card,
    },
    scoreInput: {
      minWidth: 56,
      textAlign: "center",
      fontSize: 24,
      fontWeight: "900",
      color: colors.foreground,
      paddingVertical: 6,
    },
    scoreSuffix: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.mutedForeground,
    },
    hintText: { marginTop: 8, color: colors.mutedForeground, fontSize: 13 },
    inputError: { borderColor: colors.destructive },
    errorText: {
      color: colors.destructive,
      fontSize: 14,
      marginTop: 8,
      fontWeight: "700",
      marginLeft: 4,
      letterSpacing: 0.1,
    },

    /* Preset chips (viền gradient) */
    chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chipWrap: { position: "relative", borderRadius: 999 },
    chipBorder: {
      position: "absolute",
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      borderRadius: 999,
    },
    chipInner: {
      position: "relative",
      margin: 1.5,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.card,
    },
    chipText: { fontSize: 13, color: colors.primary, fontWeight: "800" },

    /* Textarea */
    textareaContainer: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "flex-start",
      minHeight: 160,
      backgroundColor: colors.card,
    },
    textarea: {
      flex: 1,
      fontSize: 16,
      fontWeight: "500",
      minHeight: 140,
      textAlignVertical: "top",
      lineHeight: 24,
      letterSpacing: 0.2,
    },
  });
