import { useWhoAmI } from "@/apis/auth";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import z from "zod";
import { useUploadPainting } from "../apis/painting";
const SIZE = 10;
//                     B      KB    MB
const MAX_FILE_SIZE = 1024 * 1024 * SIZE;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const paintingUploadSchema = z.object({
  title: z
    .string({ required_error: "Tiêu đề bài thi là bắt buộc" })
    .trim()
    .min(2, "Tiêu đề bài thi phải có ít nhất 2 ký tự")
    .max(100, "Tiêu đề bài thi không được vượt quá 100 ký tự"),
  description: z
    .string()
    .trim()
    .max(500, "Mô tả không được vượt quá 500 ký tự")
    .optional(),
});

type PaintingUploadForm = z.infer<typeof paintingUploadSchema>;

const { width: screenWidth } = Dimensions.get("window");

// Styles
const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      padding: 15,
    },
    userInfoCard: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 6,
      padding: 10,
      marginBottom: 24,
      borderWidth: 1.2,
      borderColor: colors.border,
    },
    userInfoLabel: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginBottom: 4,
    },
    userInfoName: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.foreground,
      marginBottom: 2,
    },
    userInfoDetail: {
      fontSize: 15,
      color: colors.mutedForeground,
      marginBottom: 1,
    },
    userInfoDetailLast: {
      fontSize: 15,
      color: colors.mutedForeground,
    },
    inputSection: {
      marginBottom: 20,
    },
    inputSectionLarge: {
      marginBottom: 24,
    },
    inputLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.foreground,
      marginBottom: 8,
    },
    inputLabelWithMargin: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.foreground,
      marginBottom: 12,
    },
    textInput: {
      borderWidth: 1.2,
      borderColor: colors.border,
      backgroundColor: colors.input,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.foreground,
    },
    textInputMultiline: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.input,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.foreground,
      textAlignVertical: "top",
      minHeight: 100,
    },
    uploadSection: {
      marginBottom: 32,
    },
    uploadArea: {
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: "dashed",
      borderRadius: 12,
      padding: 32,
      alignItems: "center",
      backgroundColor: colors.muted + "20",
    },
    uploadIcon: {
      marginBottom: 12,
    },
    uploadTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.foreground,
      marginBottom: 4,
    },
    uploadSubtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
    },
    imageContainer: {
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    imagePreview: {
      width: "100%",
      height: screenWidth * 0.75,
      resizeMode: "cover",
    },
    imageOverlayButton: {
      backgroundColor: "rgba(0,0,0,0.6)",
      borderRadius: 20,
      padding: 8,
    },
    imageRemoveButton: {
      position: "absolute",
      top: 8,
      right: 8,
    },
    imageEditButton: {
      position: "absolute",
      bottom: 8,
      right: 8,
    },
    submitButton: {
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginBottom: 20,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    infoNote: {
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
    },
    infoNoteText: {
      fontSize: 12,
      textAlign: "center",
      lineHeight: 16,
    },
  });

// Color Scheme Helper
const getColorScheme = (colorScheme: "light" | "dark") => {
  const colors = Colors[colorScheme];
  return {
    background: colors.background,
    card: colors.card,
    border: colors.border,
    foreground: colors.foreground,
    mutedForeground: colors.mutedForeground,
    input: colors.input,
    muted: colors.muted,
    primary: colors.primary,
    primaryForeground: colors.primaryForeground,
  };
};

const PaintingUpload = () => {
  const { control, handleSubmit, formState } = useForm<PaintingUploadForm>({
    mode: "all",
    resolver: zodResolver(paintingUploadSchema),
  });

  const { data: currentUser, isLoading, isError } = useWhoAmI();
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";

  // Get colors and styles
  const colors = getColorScheme(colorScheme);
  const styles = createStyles(colors);
  const { mutate } = useUploadPainting();
  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Thông báo",
          "Cần quyền truy cập thư viện ảnh để tải lên tranh vẽ"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        // Basic validation
        if (file.fileSize && file.fileSize > MAX_FILE_SIZE) {
          Alert.alert("Lỗi", `Kích thước ảnh không được vượt quá ${SIZE}MB`);
          return;
        }
        if (file.mimeType && !ACCEPTED_IMAGE_TYPES.includes(file.mimeType)) {
          Alert.alert(
            "Lỗi",
            `Chỉ hỗ trợ định dạng: ${ACCEPTED_IMAGE_TYPES.map(
              (t) => `.${t.substring(t.indexOf("/") + 1)}`
            ).join(", ")}`
          );
          return;
        }
        setImage(file);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải ảnh. Vui lòng thử lại.");
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Thông báo",
          "Cần quyền truy cập camera để chụp ảnh tranh vẽ"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const img = result.assets[0];
        // Basic validation
        if (img.fileSize && img.fileSize > MAX_FILE_SIZE) {
          Alert.alert("Lỗi", `Kích thước ảnh không được vượt quá ${SIZE}MB`);
          return;
        }
        if (img.mimeType && !ACCEPTED_IMAGE_TYPES.includes(img.mimeType)) {
          Alert.alert(
            "Lỗi",
            `Chỉ hỗ trợ định dạng: ${ACCEPTED_IMAGE_TYPES.map(
              (t) => `.${t.substring(t.indexOf("/") + 1)}`
            ).join(", ")}`
          );
          return;
        }
        setImage(img);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      "Chọn ảnh",
      "Bạn muốn tải ảnh từ đâu?",
      [
        { text: "Thư viện", onPress: pickImage },
        { text: "Chụp ảnh", onPress: takePhoto },
        { text: "Hủy", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const removeImage = () => {
    setImage(null);
  };

  const onSubmit = async (data: PaintingUploadForm) => {
    if (!image) {
      Alert.alert("Thông báo", "Vui lòng chọn ảnh tranh vẽ để gửi bài thi");
      return;
    }

    setIsSubmitting(true);
    mutate({
      title: data.title,
      description: data.description,
      file: {
        uri: image.uri,
        name: image.fileName ?? `Painting of ${currentUser?.fullName}`,
        type: image.mimeType ?? "image/jpeg",
      },
      contestId: "12",
      roundId: "round1",
      competitorId: "fuck",
    });
  };
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.foreground, marginTop: 10 }}>
          Đang tải thông tin...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: colors.foreground, fontSize: 16 }}>
          Bạn cần đăng nhập trước khi có thể tham dự cuộc thi
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary, marginTop: 20 },
          ]}
        >
          <Text
            style={[
              styles.submitButtonText,
              { color: colors.primaryForeground },
            ]}
          >
            Đăng nhập
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ... existing code ...

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: colors.foreground,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Bài vẽ dự thi
        </Text>
        {/* User Info */}
        <View style={styles.userInfoCard}>
          <View>
            <Text style={styles.userInfoLabel}>Thí sinh</Text>
            <Text style={styles.userInfoName}>{currentUser?.fullName}</Text>
          </View>
          <View>
            <Text style={styles.userInfoDetail}>{currentUser?.schoolName}</Text>
            <Text style={styles.userInfoDetailLast}>
              Lớp {currentUser?.grade}
            </Text>
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Tiêu đề tác phẩm *</Text>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <TextInput
                placeholder="Nhập tiêu đề cho tác phẩm của bạn"
                style={styles.textInput}
                placeholderTextColor={colors.mutedForeground}
                maxLength={100}
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
          {formState.errors.title && (
            <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
              {formState.errors.title.message}
            </Text>
          )}
        </View>

        {/* Description Input */}
        <View style={styles.inputSectionLarge}>
          <Text style={styles.inputLabel}>Mô tả (tùy chọn)</Text>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <TextInput
                placeholder="Chia sẻ về tác phẩm, cảm hứng sáng tác..."
                multiline
                numberOfLines={4}
                style={styles.textInputMultiline}
                placeholderTextColor={colors.mutedForeground}
                maxLength={500}
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
        </View>

        {/* Image Upload Section */}
        <View style={styles.uploadSection}>
          <Text style={styles.inputLabelWithMargin}>Ảnh tác phẩm *</Text>

          {!image ? (
            <TouchableOpacity
              onPress={showImageOptions}
              style={styles.uploadArea}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={48}
                color={colors.mutedForeground}
                style={styles.uploadIcon}
              />
              <Text style={styles.uploadTitle}>Tải ảnh tranh vẽ</Text>
              <Text style={styles.uploadSubtitle}>Chọn ảnh từ thư viện</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
              <View
                style={[styles.imageOverlayButton, styles.imageRemoveButton]}
              >
                <TouchableOpacity onPress={removeImage}>
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
              <View style={[styles.imageOverlayButton, styles.imageEditButton]}>
                <TouchableOpacity onPress={showImageOptions}>
                  <Ionicons name="camera" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || !formState.isValid || !image}
          style={[
            styles.submitButton,
            {
              backgroundColor:
                isSubmitting || !formState.isValid || !image
                  ? colors.muted
                  : colors.primary,
              opacity: isSubmitting || !formState.isValid || !image ? 0.6 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.submitButtonText,
              {
                color:
                  isSubmitting || !formState.isValid || !image
                    ? colors.mutedForeground
                    : colors.primaryForeground,
              },
            ]}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi bài thi"}
          </Text>
        </TouchableOpacity>

        {/* Info Note */}
        <View
          style={[styles.infoNote, { backgroundColor: colors.muted + "40" }]}
        >
          <Text
            style={[styles.infoNoteText, { color: colors.mutedForeground }]}
          >
            Lưu ý: Sau khi gửi bài thi, bạn không thể chỉnh sửa. Vui lòng kiểm
            tra kỹ trước khi gửi.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PaintingUpload;
