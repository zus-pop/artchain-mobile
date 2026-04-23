// app/painting-evaluation-round1.tsx
import { useWhoAmI } from "@/apis/auth";
import { useEvaluatePaintingRound2 } from "@/apis/painting";
import BrushButton from "@/components/buttons/BrushButton";
import EvaluationSubmitModal from "@/components/modals/EvaluationSubmitModal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { HEADER_HEIGHT } from "@/constants/headerConfig";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Zoomable } from "@likashefqet/react-native-image-zoom";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { z } from "zod";

// NEW: card tách riêng

/* ---------- Helpers ---------- */
const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);
const STEP = 1;
const roundToStep = (n: number, step = STEP) => Math.round(n / step) * step;

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
const evaluationSchema = z.object({
  creativityScore: z
    .number({ invalid_type_error: "Điểm phải là số" })
    .min(0, "Điểm phải ít nhất là 0")
    .max(30, "Điểm không được vượt quá 30"),
  compositionScore: z
    .number({ invalid_type_error: "Điểm phải là số" })
    .min(0, "Điểm phải ít nhất là 0")
    .max(20, "Điểm không được vượt quá 20"),
  colorScore: z
    .number({ invalid_type_error: "Điểm phải là số" })
    .min(0, "Điểm phải ít nhất là 0")
    .max(20, "Điểm không được vượt quá 20"),
  technicalScore: z
    .number({ invalid_type_error: "Điểm phải là số" })
    .min(0, "Điểm phải ít nhất là 0")
    .max(20, "Điểm không được vượt quá 20"),
  aestheticScore: z
    .number({ invalid_type_error: "Điểm phải là số" })
    .min(0, "Điểm phải ít nhất là 0")
    .max(10, "Điểm không được vượt quá 10"),
});

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

export default function PaintingEvaluationRound2Screen() {
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
  const insets = useSafeAreaInsets();

  const topInset = useMemo(() => {
    if (insets.top === 0) {
      return Platform.OS === "ios" ? 44 : 0;
    }
    return insets.top;
  }, [insets.top]);

  const headerHeight = HEADER_HEIGHT + topInset;

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      creativityScore: 15,
      compositionScore: 10,
      colorScore: 10,
      technicalScore: 10,
      aestheticScore: 5,
    },
    mode: "all",
  });

  const { data: examiner } = useWhoAmI();
  const { mutate, isPending } = useEvaluatePaintingRound2();

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
        creativityScore: data.creativityScore,
        compositionScore: data.compositionScore,
        colorScore: data.colorScore,
        technicalScore: data.technicalScore,
        aestheticScore: data.aestheticScore,
      },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setSuccessOpen(true);
        },
      },
    );
  };
  const onSubmit = () => setConfirmOpen(true);

  /* ---------- Score Steppers ---------- */
  const bumpCreativityScore = (delta: number) => {
    const cur = Number(getValues("creativityScore") ?? 15);
    const next = clamp(roundToStep(cur + delta), 0, 30);
    setValue("creativityScore", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const bumpCompositionScore = (delta: number) => {
    const cur = Number(getValues("compositionScore") ?? 10);
    const next = clamp(roundToStep(cur + delta), 0, 20);
    setValue("compositionScore", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const bumpColorScore = (delta: number) => {
    const cur = Number(getValues("colorScore") ?? 10);
    const next = clamp(roundToStep(cur + delta), 0, 20);
    setValue("colorScore", next, { shouldValidate: true, shouldDirty: true });
  };

  const bumpTechnicalScore = (delta: number) => {
    const cur = Number(getValues("technicalScore") ?? 10);
    const next = clamp(roundToStep(cur + delta), 0, 20);
    setValue("technicalScore", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const bumpAestheticScore = (delta: number) => {
    const cur = Number(getValues("aestheticScore") ?? 5);
    const next = clamp(roundToStep(cur + delta), 0, 10);
    setValue("aestheticScore", next, {
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
          {/* Status Bar */}
          <StatusBar
            barStyle={scheme === "dark" ? "light-content" : "dark-content"}
            backgroundColor={colors.card}
          />

          {/* Header */}
          <View
            style={[
              styles(colors).customHeader,
              {
                height: headerHeight,
                paddingTop: topInset,
                backgroundColor: colors.card,
              },
            ]}
          >
            <View style={styles(colors).headerContent}>
              <Pressable
                onPress={handleBack}
                style={styles(colors).backButton}
                android_ripple={{ color: "rgba(0,0,0,0.08)" }}
                hitSlop={8}
              >
                <Ionicons
                  name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
                  size={24}
                  color={colors.foreground}
                />
              </Pressable>
              <ThemedText
                style={[
                  styles(colors).headerTitle,
                  { color: colors.foreground },
                ]}
                numberOfLines={1}
              >
                Đánh giá Vòng Chung Khảo
              </ThemedText>
              <View style={{ width: 48 }} />
            </View>
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
              {/* Image and details section */}
              <View style={styles(colors).frameWrap}>
                <View style={styles(colors).paintingCard}>
                  {imageUrl ? (
                    <Image
                      source={{ uri: String(imageUrl) }}
                      style={styles(colors).paintingImage}
                      placeholder={require("@/assets/images/partial-react-logo.png")}
                      contentFit="cover"
                      transition={150}
                    />
                  ) : (
                    <View style={styles(colors).noImageContainer}>
                      <Ionicons
                        name="image-outline"
                        size={48}
                        color={colors.mutedForeground}
                      />
                      <ThemedText style={styles(colors).noImageText}>
                        Không có hình ảnh
                      </ThemedText>
                    </View>
                  )}

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

              <View style={styles(colors).scoreInputs}>
                {/* Creativity Score */}
                <View style={styles(colors).scoreInputRow}>
                  <ThemedText style={styles(colors).scoreLabel}>
                    Sáng tạo
                  </ThemedText>
                  <View style={styles(colors).scoreRow}>
                    <PressableScale
                      onPress={() => bumpCreativityScore(-STEP)}
                      style={styles(colors).circleBtnLg}
                    >
                      <Ionicons
                        name="remove"
                        size={20}
                        color={colors.primary}
                      />
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
                        <Ionicons
                          name="color-palette"
                          size={18}
                          color={colors.primary}
                        />
                        <Controller
                          control={control}
                          name="creativityScore"
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              placeholder="—"
                              value={
                                value === undefined
                                  ? ""
                                  : Number(value).toString()
                              }
                              onChangeText={(text) => {
                                const t = text.replace(",", ".").trim();
                                if (t === "") {
                                  onChange(undefined as any);
                                  return;
                                }
                                const n = Number(t);
                                const safe = Number.isFinite(n)
                                  ? clamp(roundToStep(n), 0, 30)
                                  : 15;
                                onChange(safe);
                              }}
                              keyboardType="numeric"
                              style={styles(colors).scoreInput}
                              placeholderTextColor={colors.mutedForeground}
                            />
                          )}
                        />
                        <ThemedText style={styles(colors).scoreSuffix}>
                          /30
                        </ThemedText>
                      </View>
                    </View>

                    <PressableScale
                      onPress={() => bumpCreativityScore(STEP)}
                      style={styles(colors).circleBtnLg}
                    >
                      <Ionicons name="add" size={20} color={colors.primary} />
                    </PressableScale>
                  </View>
                  <Controller
                    control={control}
                    name="creativityScore"
                    render={({ fieldState: { error } }) =>
                      error ? (
                        <ThemedText style={styles(colors).errorText}>
                          {error.message}
                        </ThemedText>
                      ) : (
                        <></>
                      )
                    }
                  />
                </View>

                {/* Composition Score */}
                <View style={styles(colors).scoreInputRow}>
                  <ThemedText style={styles(colors).scoreLabel}>
                    Bố cục
                  </ThemedText>
                  <View style={styles(colors).scoreRow}>
                    <PressableScale
                      onPress={() => bumpCompositionScore(-STEP)}
                      style={styles(colors).circleBtnLg}
                    >
                      <Ionicons
                        name="remove"
                        size={20}
                        color={colors.primary}
                      />
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
                        <Ionicons
                          name="grid"
                          size={18}
                          color={colors.primary}
                        />
                        <Controller
                          control={control}
                          name="compositionScore"
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              placeholder="—"
                              value={
                                value === undefined
                                  ? ""
                                  : Number(value).toString()
                              }
                              onChangeText={(text) => {
                                const t = text.replace(",", ".").trim();
                                if (t === "") {
                                  onChange(undefined as any);
                                  return;
                                }
                                const n = Number(t);
                                const safe = Number.isFinite(n)
                                  ? clamp(roundToStep(n), 0, 20)
                                  : 10;
                                onChange(safe);
                              }}
                              keyboardType="numeric"
                              style={styles(colors).scoreInput}
                              placeholderTextColor={colors.mutedForeground}
                            />
                          )}
                        />
                        <ThemedText style={styles(colors).scoreSuffix}>
                          /20
                        </ThemedText>
                      </View>
                    </View>

                    <PressableScale
                      onPress={() => bumpCompositionScore(STEP)}
                      style={styles(colors).circleBtnLg}
                    >
                      <Ionicons name="add" size={20} color={colors.primary} />
                    </PressableScale>
                  </View>
                </View>

                {/* Color Score */}
                <View style={styles(colors).scoreInputRow}>
                  <ThemedText style={styles(colors).scoreLabel}>
                    Màu sắc
                  </ThemedText>
                  <View style={styles(colors).scoreRow}>
                    <PressableScale
                      onPress={() => bumpColorScore(-STEP)}
                      style={styles(colors).circleBtnLg}
                    >
                      <Ionicons
                        name="remove"
                        size={20}
                        color={colors.primary}
                      />
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
                        <Ionicons
                          name="color-fill"
                          size={18}
                          color={colors.primary}
                        />
                        <Controller
                          control={control}
                          name="colorScore"
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              placeholder="—"
                              value={
                                value === undefined
                                  ? ""
                                  : Number(value).toString()
                              }
                              onChangeText={(text) => {
                                const t = text.replace(",", ".").trim();
                                if (t === "") {
                                  onChange(undefined as any);
                                  return;
                                }
                                const n = Number(t);
                                const safe = Number.isFinite(n)
                                  ? clamp(roundToStep(n), 0, 20)
                                  : 10;
                                onChange(safe);
                              }}
                              keyboardType="numeric"
                              style={styles(colors).scoreInput}
                              placeholderTextColor={colors.mutedForeground}
                            />
                          )}
                        />
                        <ThemedText style={styles(colors).scoreSuffix}>
                          /20
                        </ThemedText>
                      </View>
                    </View>

                    <PressableScale
                      onPress={() => bumpColorScore(STEP)}
                      style={styles(colors).circleBtnLg}
                    >
                      <Ionicons name="add" size={20} color={colors.primary} />
                    </PressableScale>
                  </View>
                </View>

                {/* Technical Score */}
                <View style={styles(colors).scoreInputRow}>
                  <ThemedText style={styles(colors).scoreLabel}>
                    Kỹ thuật
                  </ThemedText>
                  <View style={styles(colors).scoreRow}>
                    <PressableScale
                      onPress={() => bumpTechnicalScore(-STEP)}
                      style={styles(colors).circleBtnLg}
                    >
                      <Ionicons
                        name="remove"
                        size={20}
                        color={colors.primary}
                      />
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
                        <Ionicons
                          name="brush"
                          size={18}
                          color={colors.primary}
                        />
                        <Controller
                          control={control}
                          name="technicalScore"
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              placeholder="—"
                              value={
                                value === undefined
                                  ? ""
                                  : Number(value).toString()
                              }
                              onChangeText={(text) => {
                                const t = text.replace(",", ".").trim();
                                if (t === "") {
                                  onChange(undefined as any);
                                  return;
                                }
                                const n = Number(t);
                                const safe = Number.isFinite(n)
                                  ? clamp(roundToStep(n), 0, 20)
                                  : 10;
                                onChange(safe);
                              }}
                              keyboardType="numeric"
                              style={styles(colors).scoreInput}
                              placeholderTextColor={colors.mutedForeground}
                            />
                          )}
                        />
                        <ThemedText style={styles(colors).scoreSuffix}>
                          /20
                        </ThemedText>
                      </View>
                    </View>

                    <PressableScale
                      onPress={() => bumpTechnicalScore(STEP)}
                      style={styles(colors).circleBtnLg}
                    >
                      <Ionicons name="add" size={20} color={colors.primary} />
                    </PressableScale>
                  </View>
                </View>

                {/* Aesthetic Score */}
                <View style={styles(colors).scoreInputRow}>
                  <ThemedText style={styles(colors).scoreLabel}>
                    Thẩm mỹ
                  </ThemedText>
                  <View style={styles(colors).scoreRow}>
                    <PressableScale
                      onPress={() => bumpAestheticScore(-STEP)}
                      style={styles(colors).circleBtnLg}
                    >
                      <Ionicons
                        name="remove"
                        size={20}
                        color={colors.primary}
                      />
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
                        <Ionicons
                          name="sparkles"
                          size={18}
                          color={colors.primary}
                        />
                        <Controller
                          control={control}
                          name="aestheticScore"
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              placeholder="—"
                              value={
                                value === undefined
                                  ? ""
                                  : Number(value).toString()
                              }
                              onChangeText={(text) => {
                                const t = text.replace(",", ".").trim();
                                if (t === "") {
                                  onChange(undefined as any);
                                  return;
                                }
                                const n = Number(t);
                                const safe = Number.isFinite(n)
                                  ? clamp(roundToStep(n), 0, 10)
                                  : 5;
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
                      onPress={() => bumpAestheticScore(STEP)}
                      style={styles(colors).circleBtnLg}
                    >
                      <Ionicons name="add" size={20} color={colors.primary} />
                    </PressableScale>
                  </View>
                </View>
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
          onPrimary={() => onConfirmSubmit(getValues())}
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
    customHeader: {
      justifyContent: "flex-end",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    headerContent: {
      height: HEADER_HEIGHT,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      gap: 8,
    },
    backButton: {
      width: 48,
      height: 48,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: "700",
      textAlign: "center",
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

    scrollContent: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 12 },
    section: { marginBottom: 16 },

    /* Frame + image */
    frameWrap: { position: "relative", borderRadius: 16 },
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
    noImageContainer: {
      width: "100%",
      height: 280,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.muted,
    },
    noImageText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.mutedForeground,
      fontWeight: "600",
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

    microDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: "rgba(2, 6, 23, 0.08)",
      marginHorizontal: 12,
      marginTop: 8,
    },

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

    scoreInputs: { gap: 16 },
    scoreInputRow: { marginBottom: 8 },
    scoreLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.foreground,
      marginBottom: 6,
    },
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
    errorText: {
      fontSize: 12,
      color: colors.destructive,
      marginTop: 4,
    },
  });
