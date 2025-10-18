import BrushButton from "@/components/buttons/BrushButton";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { toast } from "sonner-native";
import { z } from "zod";
import { useWhoAmI } from "../apis/auth";
import { useEvaluatePainting } from "../apis/painting";

const evaluationSchema = z.object({
  score: z
    .number()
    .min(1, "Điểm phải ít nhất là 1")
    .max(10, "Điểm không được vượt quá 10"),
  feedback: z.string().min(10, "Lời đánh giá phải ít nhất 10 ký tự"),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

export default function PaintingEvaluationScreen() {
  const { paintingTitle, artistName, contestTitle, imageUrl, paintingId } =
    useLocalSearchParams<{
      paintingId: string;
      contestTitle: string;
      paintingTitle: string;
      artistName: string;
      imageUrl: string;
    }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      score: 5,
      feedback: "",
    },
    mode: "all",
  });
  const { data: examiner } = useWhoAmI();
  const { mutate, isPending } = useEvaluatePainting();
  const onSubmit = async (data: EvaluationFormData) => {
    if (!examiner) {
      toast.info("Không có thông tin giám khảo");
      return;
    }

    if (examiner.role !== "EXAMINER") {
      toast.info("Người dùng đăng nhập không phải giảm khảo chấm thi");
      return;
    }

    Alert.alert(
      "Xác nhận đánh giá",
      `Bạn có chắc chắn muốn gửi đánh giá với điểm ${data.score}/10 cho bức tranh "${paintingTitle}" của ${artistName} trong cuộc thi "${contestTitle}"?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xác nhận",
          style: "default",
          onPress: () => {
            mutate({
              examinerId: examiner.userId,
              paintingId: paintingId,
              score: data.score,
              feedback: data.feedback,
            });
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles(colors).container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        {/* Header */}
        <View style={styles(colors).header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles(colors).backButton}
          >
            <Ionicons name="chevron-back" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <ThemedText style={styles(colors).headerTitle}>
            Đánh giá Tranh
          </ThemedText>
          <View style={styles(colors).headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles(colors).scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Painting Details */}
          <View style={styles(colors).paintingSection}>
            <View style={styles(colors).paintingContainer}>
              <View style={styles(colors).paintingFrame}>
                <Image
                  source={{
                    uri: imageUrl,
                  }}
                  style={styles(colors).paintingImage}
                  placeholder={require("@/assets/images/partial-react-logo.png")}
                  contentFit="cover"
                />
              </View>

              <View style={styles(colors).paintingDetails}>
                <View style={styles(colors).titleSection}>
                  <ThemedText style={styles(colors).paintingTitle}>
                    {paintingTitle}
                  </ThemedText>
                  <View style={styles(colors).artistSection}>
                    <Ionicons
                      name="person-outline"
                      size={16}
                      color={colors.mutedForeground}
                    />
                    <ThemedText style={styles(colors).artistName}>
                      {artistName}
                    </ThemedText>
                  </View>
                  <View style={styles(colors).contestSection}>
                    <Ionicons
                      name="trophy-outline"
                      size={16}
                      color={colors.mutedForeground}
                    />
                    <ThemedText style={styles(colors).contestName}>
                      {contestTitle}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Evaluation Form */}
          <View style={styles(colors).formSection}>
            <View style={styles(colors).decorativeDivider} />
            <ThemedText type="subtitle" style={styles(colors).formTitle}>
              Đánh giá của Bạn
            </ThemedText>

            {/* Score Input */}
            <View style={styles(colors).inputGroup}>
              <ThemedText style={styles(colors).label}>Điểm (1-10)</ThemedText>
              <View
                style={[
                  styles(colors).inputContainer,
                  errors.score && styles(colors).inputError,
                ]}
              >
                <Ionicons
                  name="star"
                  size={20}
                  color={colors.primary}
                  style={styles(colors).inputIcon}
                />
                <Controller
                  control={control}
                  name="score"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="Nhập điểm"
                      value={value?.toString()}
                      onChangeText={(text) => onChange(parseInt(text) || 0)}
                      keyboardType="numeric"
                      style={[
                        styles(colors).input,
                        { color: colors.foreground },
                      ]}
                      placeholderTextColor={colors.mutedForeground}
                    />
                  )}
                />
              </View>
              {errors.score && (
                <ThemedText style={styles(colors).errorText}>
                  {errors.score.message}
                </ThemedText>
              )}
            </View>

            {/* Feedback Input */}
            <View style={styles(colors).inputGroup}>
              <ThemedText style={styles(colors).label}>Đánh giá</ThemedText>
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
                  style={[styles(colors).inputIcon, { marginTop: 16 }]}
                />
                <Controller
                  control={control}
                  name="feedback"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="Cung cấp đánh giá chi tiết về bức tranh này..."
                      value={value}
                      onChangeText={onChange}
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

            {/* Submit Button */}
            <View style={styles(colors).buttonContainer}>
              <BrushButton
                title={isPending ? "Đang gửi..." : "Gửi Đánh giá"}
                onPress={handleSubmit(onSubmit)}
                disabled={isPending || !isValid}
                palette="pastel"
                size="lg"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 20,
      paddingTop: Platform.OS === "ios" ? 50 : 20,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    backButton: {
      padding: 12,
      marginRight: 16,
      borderRadius: 20,
      backgroundColor: colors.input,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.foreground,
      flex: 1,
      textAlign: "center",
      letterSpacing: 0.5,
    },
    headerSpacer: {
      width: 48,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    paintingSection: {
      marginBottom: 40,
    },
    paintingContainer: {
      alignItems: "center",
    },
    paintingFrame: {
      position: "relative",
      marginBottom: 24,
    },
    paintingImage: {
      width: 350,
      height: 280,
      borderRadius: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    paintingOverlay: {
      position: "absolute",
      top: 16,
      right: 16,
    },
    paintingBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    paintingBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary,
      marginLeft: 6,
      letterSpacing: 0.5,
    },
    paintingDetails: {
      alignItems: "center",
      width: "100%",
      maxWidth: 320,
    },
    titleSection: {
      alignItems: "center",
      marginBottom: 16,
    },
    paintingTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.foreground,
      textAlign: "center",
      marginBottom: 12,
      lineHeight: 32,
      letterSpacing: 0.5,
    },
    artistSection: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.input,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    artistName: {
      fontSize: 16,
      color: colors.mutedForeground,
      fontWeight: "500",
      marginLeft: 8,
      letterSpacing: 0.2,
    },
    contestSection: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.input,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 8,
    },
    contestName: {
      fontSize: 16,
      color: colors.mutedForeground,
      fontWeight: "500",
      marginLeft: 8,
      letterSpacing: 0.2,
    },
    paintingMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 8,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.input,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metaText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontWeight: "500",
      marginLeft: 6,
      letterSpacing: 0.2,
    },
    formSection: {
      flex: 1,
    },
    decorativeDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 32,
      marginHorizontal: 40,
      borderRadius: 0.5,
    },
    formTitle: {
      marginBottom: 32,
      color: colors.foreground,
      fontSize: 22,
      fontWeight: "600",
      textAlign: "center",
      letterSpacing: 0.5,
    },
    inputGroup: {
      marginBottom: 28,
    },
    label: {
      fontSize: 17,
      fontWeight: "600",
      marginBottom: 16,
      color: colors.foreground,
      letterSpacing: 0.3,
      marginLeft: 4,
    },
    inputContainer: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.input,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
      minHeight: 56,
    },
    textareaContainer: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.input,
      minHeight: 160,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    inputIcon: {
      marginRight: 16,
    },
    input: {
      flex: 1,
      fontSize: 16,
      fontWeight: "500",
      color: colors.foreground,
      letterSpacing: 0.2,
    },
    textarea: {
      flex: 1,
      fontSize: 16,
      fontWeight: "500",
      minHeight: 140,
      color: colors.foreground,
      textAlignVertical: "top",
      lineHeight: 24,
      letterSpacing: 0.2,
    },
    inputError: {
      borderColor: colors.destructive,
      borderWidth: 2,
      shadowColor: colors.destructive,
      shadowOpacity: 0.15,
    },
    errorText: {
      color: colors.destructive,
      fontSize: 14,
      marginTop: 10,
      fontWeight: "500",
      marginLeft: 8,
      letterSpacing: 0.1,
    },
    buttonContainer: {
      alignItems: "center",
      marginTop: 24,
      marginBottom: 40,
    },
  });
