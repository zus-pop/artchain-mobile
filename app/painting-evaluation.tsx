import BrushButton from "@/components/buttons/BrushButton";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";

const evaluationSchema = z.object({
  score: z
    .number()
    .min(1, "Điểm phải ít nhất là 1")
    .max(10, "Điểm không được vượt quá 10"),
  feedback: z.string().min(10, "Lời đánh giá phải ít nhất 10 ký tự"),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

export default function PaintingEvaluationScreen() {
  const { paintingTitle, artistName } = useLocalSearchParams<{
    paintingId: string;
    contestId: string;
    paintingTitle: string;
    artistName: string;
    imageUrl: string;
  }>();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      score: 5,
      feedback: "",
    },
    mode: "all",
  });

  const onSubmit = async (data: EvaluationFormData) => {
    try {
      setIsSubmitting(true);

      // TODO: Replace with actual API call to submit evaluation
      // await submitEvaluation({
      //   paintingId,
      //   contestId,
      //   score: data.score,
      //   feedback: data.feedback,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert("Thành công", "Đánh giá đã được gửi thành công!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch {
      Alert.alert("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles(colors).container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={styles(colors).scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Painting Details */}
          <View style={styles(colors).paintingSection}>
            <ThemedText type="title" style={styles(colors).title}>
              Đánh giá Tranh
            </ThemedText>

            <View style={styles(colors).paintingCard}>
              <Image
                source={{
                  uri: "https://camo.githubusercontent.com/3cae61090608b8cbd681f5825ca5ac76af8d8d3ee12024926d51c5480aef5d6c/68747470733a2f2f796176757a63656c696b65722e6769746875622e696f2f73616d706c652d696d616765732f696d6167652d313032312e6a7067",
                }}
                style={styles(colors).paintingImage}
                placeholder={require("@/assets/images/partial-react-logo.png")}
                contentFit="cover"
              />

              <View style={styles(colors).paintingInfo}>
                <ThemedText
                  type="subtitle"
                  style={styles(colors).paintingTitle}
                >
                  {paintingTitle}
                </ThemedText>
                <ThemedText style={styles(colors).artistName}>
                  của {artistName}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Evaluation Form */}
          <View style={styles(colors).formSection}>
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
                  size={16}
                  color={colors.mutedForeground}
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
                  size={16}
                  color={colors.mutedForeground}
                  style={[styles(colors).inputIcon, { marginTop: 12 }]}
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
                title={isSubmitting ? "Đang gửi..." : "Gửi Đánh giá"}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
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
    scrollContent: {
      flexGrow: 1,
      padding: 16,
    },
    paintingSection: {
      marginBottom: 24,
    },
    title: {
      marginBottom: 8,
      paddingVertical: 4,
      textAlign: "center",
      color: colors.foreground,
    },
    paintingCard: {
      alignItems: "center",
    },
    paintingImage: {
      width: "100%",
      height: 250,
      borderRadius: 8,
    },
    paintingInfo: {
      alignItems: "center",
    },
    paintingTitle: {
      fontSize: 18,
      fontWeight: "600",
    },
    artistName: {
      fontSize: 20,
      color: colors.foreground,
    },
    formSection: {
      flex: 1,
    },
    formTitle: {
      marginBottom: 16,
      color: colors.foreground,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      marginBottom: 8,
      color: colors.foreground,
    },
    inputContainer: {
      borderWidth: StyleSheet.hairlineWidth + 0.5,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.input,
    },
    textareaContainer: {
      borderWidth: StyleSheet.hairlineWidth + 0.5,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.input,
      minHeight: 120,
    },
    inputIcon: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      fontWeight: "600",
    },
    textarea: {
      flex: 1,
      fontWeight: "600",
      minHeight: 100,
    },
    inputError: {
      borderColor: colors.destructive,
    },
    errorText: {
      color: colors.destructive,
      fontSize: 14,
      marginTop: 4,
    },
    buttonContainer: {
      alignItems: "center",
    },
  });
