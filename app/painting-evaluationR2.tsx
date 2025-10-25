// app/painting-evaluation.tsx
import BrushButton from "@/components/buttons/BrushButton";
import ZoomableLightbox from "@/components/media/ZoomableLightbox";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";

/* ============== FAKE DATA ============== */
const FALLBACK_ART = {
  imageUrl:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
  paintingTitle: "Sắc Thu Trên Phố",
};

const FAKE_STUDENT = {
  name: "Nguyễn Minh An",
  candidateId: "AC25-078",
  school: "THPT Lê Quý Đôn, TP.HCM",
  age: 17,
  topic: "Thành phố bền vững",
  medium: "Màu nước trên giấy",
  size: "40 x 60 cm",
};

/* ============== SCHEMA ============== */
const rubricSchema = z.object({
  key: z.string(),
  label: z.string(),
  weight: z.number().min(0).max(1),
  score: z.number().min(1).max(10), // chấm bằng sao
});

const evaluationSchema = z
  .object({
    flags: z
      .object({
        needReview: z.boolean().default(false),
        suspectedAI: z.boolean().default(false),
        violation: z.boolean().default(false),
      })
      .default({ needReview: false, suspectedAI: false, violation: false }),
    reasons: z
      .object({
        needReview: z.string().optional(),
        suspectedAI: z.string().optional(),
        violation: z.string().optional(),
      })
      .default({}),
    rubric: z.array(rubricSchema).min(1),
    feedback: z.string().min(10, "Lời nhận xét phải ít nhất 10 ký tự"),
  })
  .superRefine((val, ctx) => {
    (
      [
        ["needReview", "Cần xem lại"],
        ["suspectedAI", "Nghi AI"],
        ["violation", "Vi phạm"],
      ] as const
    ).forEach(([k, label]) => {
      const on = (val.flags as any)[k];
      const reason = (val.reasons as any)[k];
      if (on && (!reason || reason.trim().length < 5)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Vui lòng ghi lý do cho cờ “${label}” (≥ 5 ký tự).`,
          path: ["reasons", k],
        });
      }
    });
  });

type EvaluationFormData = z.infer<typeof evaluationSchema>;
type LocalParams = {
  paintingId?: string;
  contestId?: string;
  paintingTitle?: string;
  artistName?: string;
  imageUrl?: string;
};

/* ============== SUB-COMPS (Stars, FlagToggle, FlagModal) ============== */
const TenStarInput: React.FC<{
  value: number;
  onChange: (n: number) => void;
  size?: number;
  activeColor?: string;
  idleColor?: string;
}> = ({
  value,
  onChange,
  size = 22,
  activeColor = "#f59e0b",
  idleColor = "#9ca3af",
}) => {
  const stars = Array.from({ length: 10 }, (_, i) => i + 1);

  const handlePress = (n: number) => {
    // Nếu bấm lại đúng số sao hiện tại -> về 0
    if (n === value) return onChange(0);
    // Nếu bấm vào ngôi sao đầu tiên khi đang là 1 -> về 0
    if (n === 1 && value === 1) return onChange(0);
    onChange(n);
  };

  return (
    <Pressable
      onLongPress={() => onChange(0)} // tuỳ chọn: long-press để clear
      hitSlop={8}
      style={{ flexDirection: "row", gap: 4, flexWrap: "wrap" }}
    >
      {stars.map((n) => {
        const active = value >= n && value > 0;
        return (
          <Pressable key={n} onPress={() => handlePress(n)} hitSlop={8}>
            <Ionicons
              name={active ? "star" : "star-outline"}
              size={size}
              color={active ? activeColor : idleColor}
            />
          </Pressable>
        );
      })}
    </Pressable>
  );
};

const FlagToggle: React.FC<{
  label: string;
  icon: any;
  active: boolean;
  onToggle: () => void;
  colors: typeof Colors.light;
}> = ({ label, icon, active, onToggle, colors }) => {
  const warnBg = "rgba(254,243,199,0.27)";
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderRadius: 999,
          borderWidth: StyleSheet.hairlineWidth,
          gap: 6,
        },
        active
          ? { backgroundColor: warnBg, borderColor: colors.primary }
          : { backgroundColor: colors.input, borderColor: colors.border },
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={active ? colors.primary : colors.mutedForeground}
      />
      <Text
        style={{
          color: active ? colors.primary : colors.mutedForeground,
          fontWeight: "600",
          fontSize: 12,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const FlagReasonModal: React.FC<{
  visible: boolean;
  title: string;
  placeholder: string;
  defaultReason?: string;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
  colors: typeof Colors.light;
}> = ({
  visible,
  title,
  placeholder,
  defaultReason,
  onCancel,
  onConfirm,
  colors,
}) => {
  const [text, setText] = useState(defaultReason ?? "");
  React.useEffect(() => setText(defaultReason ?? ""), [defaultReason, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={flagStyles(colors).modalBackdrop}>
        <View style={flagStyles(colors).modalCard}>
          <Text style={flagStyles(colors).modalTitle}>{title}</Text>
          <TextInput
            placeholder={placeholder}
            placeholderTextColor={colors.mutedForeground}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={5}
            style={flagStyles(colors).modalTextarea}
            textAlignVertical="top"
          />
          <View style={flagStyles(colors).modalActions}>
            <Pressable style={flagStyles(colors).ghostBtn} onPress={onCancel}>
              <Text
                style={{ color: colors.mutedForeground, fontWeight: "700" }}
              >
                Hủy
              </Text>
            </Pressable>
            <Pressable
              style={[
                flagStyles(colors).primaryBtn,
                { opacity: text.trim().length >= 5 ? 1 : 0.5 },
              ]}
              disabled={text.trim().length < 5}
              onPress={() => onConfirm(text.trim())}
            >
              <Text
                style={{ color: colors.primaryForeground, fontWeight: "800" }}
              >
                Xác nhận
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* ============== SCREEN ============== */
export default function PaintingEvaluationScreen() {
  const params = useLocalSearchParams<LocalParams>();
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  // Flag reason modal
  const [flagModal, setFlagModal] = useState<{
    key?: "needReview" | "suspectedAI" | "violation";
    title?: string;
    visible: boolean;
  }>({ visible: false });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      flags: { needReview: false, suspectedAI: false, violation: false },
      reasons: {},
      rubric: [
        { key: "idea", label: "Ý tưởng/Thông điệp", weight: 0.3, score: 7 },
        {
          key: "technique",
          label: "Kỹ thuật/Chất liệu",
          weight: 0.25,
          score: 7,
        },
        {
          key: "composition",
          label: "Bố cục/Không gian",
          weight: 0.2,
          score: 7,
        },
        { key: "emotion", label: "Cảm xúc/Ấn tượng", weight: 0.15, score: 7 },
        { key: "theme", label: "Bám chủ đề", weight: 0.1, score: 7 },
      ],
      feedback: "",
    },
    mode: "all",
  });

  const { fields, update } = useFieldArray({
    control,
    name: "rubric",
    keyName: "id",
  });

  const totalScore10 = useMemo(() => {
    const r = watch("rubric") || [];
    const sum = r.reduce((acc, it) => acc + it.score * it.weight, 0);
    return Math.round(sum * 100) / 100;
  }, [watch("rubric")]);

  const paintingImage = params.imageUrl || FALLBACK_ART.imageUrl;
  const paintingTitle = params.paintingTitle || FALLBACK_ART.paintingTitle;
  const artistName = params.artistName || FAKE_STUDENT.name;

  const styles = getStyles(colors);

  const openFlagModal = (
    key: "needReview" | "suspectedAI" | "violation",
    title: string
  ) => setFlagModal({ key, title, visible: true });

  const onSubmit = async (data: EvaluationFormData) => {
    try {
      const payload = { ...data, derivedOverallScore: totalScore10 };
      // TODO: call API thật
      await new Promise((r) => setTimeout(r, 800));
      Alert.alert("Thành công", "Đánh giá đã được gửi!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại.");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ===== HERO with ZoomableLightbox + META (title/author) + INFO GRID ===== */}
          <View style={styles.heroCard}>
            <ZoomableLightbox
              source={{ uri: paintingImage }}
              thumbnailStyle={styles.heroImage}
              maxScale={4}
              controlColor="#fff"
            />

            {/* Title & Author dưới ảnh (không overlay) */}
            <View style={styles.heroMeta}>
              <Text style={styles.heroTitle}>{paintingTitle}</Text>
              <Text style={styles.heroSubtitle}>Tác giả: {artistName}</Text>
            </View>

            {/* INFO GRID */}
            <View style={styles.infoGrid}>
              <InfoItem
                icon="finger-print-outline"
                label="Mã thí sinh"
                value={FAKE_STUDENT.candidateId}
              />
              <InfoItem
                icon="school-outline"
                label="Trường"
                value={FAKE_STUDENT.school}
              />
              <InfoItem
                icon="person-outline"
                label="Tuổi"
                value={`${FAKE_STUDENT.age}`}
              />
              <InfoItem
                icon="pricetag-outline"
                label="Chủ đề"
                value={FAKE_STUDENT.topic}
              />
              <InfoItem
                icon="brush-outline"
                label="Chất liệu"
                value={FAKE_STUDENT.medium}
              />
              <InfoItem
                icon="resize-outline"
                label="Kích thước"
                value={FAKE_STUDENT.size}
              />
            </View>
          </View>

          {/* ===== FLAGS ===== */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="flag-outline"
                size={20}
                color={colors.mutedForeground}
              />
              <Text style={styles.cardTitle}>Đánh dấu xem xét</Text>
            </View>
            <Controller
              control={control}
              name="flags"
              render={({ field: { value, onChange } }) => (
                <View style={styles.flagsWrap}>
                  <FlagToggle
                    label="Cần xem lại"
                    icon="flag-outline"
                    active={value.needReview}
                    onToggle={() => {
                      if (!value.needReview) {
                        openFlagModal("needReview", "Lý do “Cần xem lại”");
                      } else {
                        onChange({ ...value, needReview: false });
                        setValue("reasons.needReview", "");
                      }
                    }}
                    colors={colors}
                  />
                  <FlagToggle
                    label="Nghi AI"
                    icon="code-slash-outline"
                    active={value.suspectedAI}
                    onToggle={() => {
                      if (!value.suspectedAI) {
                        openFlagModal("suspectedAI", "Lý do “Nghi ngờ AI”");
                      } else {
                        onChange({ ...value, suspectedAI: false });
                        setValue("reasons.suspectedAI", "");
                      }
                    }}
                    colors={colors}
                  />
                  <FlagToggle
                    label="Vi phạm"
                    icon="ban-outline"
                    active={value.violation}
                    onToggle={() => {
                      if (!value.violation) {
                        openFlagModal("violation", "Lý do “Vi phạm thể lệ”");
                      } else {
                        onChange({ ...value, violation: false });
                        setValue("reasons.violation", "");
                      }
                    }}
                    colors={colors}
                  />
                </View>
              )}
            />
            {!!errors.reasons && (
              <Text style={styles.errorText}>
                {errors.reasons.needReview?.message ||
                  errors.reasons.suspectedAI?.message ||
                  errors.reasons.violation?.message ||
                  ""}
              </Text>
            )}
          </View>

          {/* ===== RUBRIC ===== */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="list-circle-outline"
                size={20}
                color={colors.mutedForeground}
              />
              <Text style={styles.cardTitle}>Tiêu chí chấm điểm</Text>
            </View>

            {fields.map((f, idx) => {
              const percent = Math.round((f.score / 10) * 100);
              return (
                <View key={f.id} style={styles.rubricRow}>
                  <View style={styles.rubricTopRow}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        flexShrink: 1,
                      }}
                    >
                      <Text style={styles.rubricLabel} numberOfLines={1}>
                        {f.label}
                      </Text>
                      <View style={styles.weightChip}>
                        <Ionicons
                          name="cube-outline"
                          size={12}
                          color={colors.accentForeground}
                        />
                        <Text style={styles.weightChipTxt}>
                          {(f.weight * 100).toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.scoreSmall}>
                      {f.score}/10 • {percent}%
                    </Text>
                  </View>

                  <View style={{ marginTop: 6 }}>
                    <Controller
                      control={control}
                      name={`rubric.${idx}.score`}
                      render={({ field: { value } }) => (
                        <TenStarInput
                          value={value}
                          onChange={(n) => update(idx, { ...f, score: n })}
                          size={22}
                          activeColor="#f59e0b"
                          idleColor={colors.mutedForeground}
                        />
                      )}
                    />
                  </View>

                  <View style={styles.progressWrap}>
                    <View
                      style={[styles.progressFill, { width: `${percent}%` }]}
                    />
                  </View>
                </View>
              );
            })}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Điểm tổng (tự động):</Text>
              <View style={styles.totalBadge}>
                <Ionicons name="star" size={14} color="#fff" />
                <Text style={styles.totalTxt}>
                  {totalScore10.toFixed(2)} / 10
                </Text>
              </View>
            </View>
          </View>

          {/* ===== FEEDBACK ===== */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color={colors.mutedForeground}
              />
              <Text style={styles.cardTitle}>Nhận xét của giám khảo</Text>
            </View>

            <View style={styles.textareaContainer}>
              <Ionicons
                name="create-outline"
                size={16}
                color={colors.mutedForeground}
                style={{ marginRight: 8, marginTop: 12 }}
              />
              <Controller
                control={control}
                name="feedback"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    placeholder="Nhận xét chi tiết (≥ 10 ký tự)..."
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={6}
                    style={[styles.textarea, { color: colors.foreground }]}
                    placeholderTextColor={colors.mutedForeground}
                    textAlignVertical="top"
                  />
                )}
              />
            </View>
            {errors.feedback && (
              <Text style={styles.errorText}>{errors.feedback.message}</Text>
            )}
          </View>

          {/* ===== ACTION ===== */}
          <View style={{ alignItems: "center" }}>
            <BrushButton
              title="Gửi Đánh giá"
              onPress={handleSubmit(onSubmit)}
              palette="pastel"
              size="lg"
            />
          </View>

          <View style={{ height: 28 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FLAG REASON MODAL (giữ nguyên) */}
      <Controller
        control={control}
        name="flags"
        render={({ field: { value, onChange } }) => (
          <Controller
            control={control}
            name="reasons"
            render={({ field: { value: reasons, onChange: setReasons } }) => (
              <FlagReasonModal
                visible={flagModal.visible}
                title={flagModal.title ?? ""}
                placeholder="Ghi rõ lý do (≥ 5 ký tự) để hội đồng xem xét..."
                defaultReason={
                  flagModal.key ? (reasons as any)[flagModal.key] : undefined
                }
                onCancel={() => setFlagModal({ visible: false })}
                onConfirm={(reason) => {
                  if (!flagModal.key) return;
                  onChange({ ...value, [flagModal.key]: true });
                  setReasons({ ...reasons, [flagModal.key]: reason });
                  setFlagModal({ visible: false });
                }}
                colors={colors}
              />
            )}
          />
        )}
      />
    </ThemedView>
  );
}

/* Small info item */
const InfoItem: React.FC<{ icon: any; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <View
    style={{
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      flex: 1,
      minWidth: "48%",
    }}
  >
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "rgba(0,0,0,0.06)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={icon} size={16} color="#6b7280" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ color: "#6b7280", fontSize: 11, fontWeight: "700" }}>
        {label}
      </Text>
      <Text numberOfLines={2} style={{ color: "#111827", fontWeight: "700" }}>
        {value}
      </Text>
    </View>
  </View>
);

/* STYLES */
function getStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerBar: {
      paddingTop: 8,
      paddingHorizontal: 16,
      paddingBottom: 6,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: { paddingVertical: 4, color: colors.foreground, fontWeight: "800" },
    scrollContent: { flexGrow: 1, padding: 16 },

    heroCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 16,
      shadowColor: colors.mutedForeground,
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 1,
    },
    heroImage: { width: "100%", height: 260, borderRadius: 16 },

    // NEW: meta dưới ảnh
    heroMeta: {
      paddingHorizontal: 12,
      paddingTop: 10,
    },
    heroTitle: { color: colors.foreground, fontWeight: "900", fontSize: 18 },
    heroSubtitle: {
      color: colors.mutedForeground,
      marginTop: 4,
      fontWeight: "700",
    },

    infoGrid: { padding: 12, flexDirection: "row", flexWrap: "wrap", gap: 12 },

    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 12,
      marginBottom: 16,
      shadowColor: colors.mutedForeground,
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 1,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    cardTitle: { color: colors.foreground, fontWeight: "900" },

    flagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

    rubricRow: {
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    rubricTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    rubricLabel: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.foreground,
      maxWidth: "70%",
    },
    weightChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.muted,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
    },
    weightChipTxt: {
      color: colors.accentForeground,
      fontWeight: "800",
      fontSize: 11,
    },
    scoreSmall: {
      color: colors.mutedForeground,
      fontWeight: "800",
      marginLeft: 8,
    },

    progressWrap: {
      height: 6,
      backgroundColor: colors.input,
      borderRadius: 999,
      overflow: "hidden",
      borderColor: colors.border,
      borderWidth: StyleSheet.hairlineWidth,
      marginTop: 10,
    },
    progressFill: { height: "100%", backgroundColor: colors.primary },

    totalRow: {
      paddingTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    totalLabel: { fontWeight: "800", color: colors.foreground },
    totalBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    totalTxt: { color: "#fff", fontWeight: "900" },

    textareaContainer: {
      borderWidth: StyleSheet.hairlineWidth + 0.5,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.input,
      minHeight: 120,
      marginTop: 4,
    },
    textarea: { flex: 1, fontWeight: "600", minHeight: 100 },

    errorText: { color: colors.destructive, fontSize: 12, marginTop: 6 },
  });
}

function flagStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      alignItems: "center",
      justifyContent: "center",
      padding: 18,
    },
    modalCard: {
      width: "100%",
      maxWidth: 520,
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      gap: 10,
    },
    modalTitle: { fontWeight: "800", color: colors.foreground, fontSize: 16 },
    modalTextarea: {
      minHeight: 110,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth + 0.5,
      borderColor: colors.border,
      padding: 12,
      color: colors.foreground,
      backgroundColor: colors.input,
    },
    modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
    ghostBtn: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.muted,
    },
    primaryBtn: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.primary,
    },
  });
}
