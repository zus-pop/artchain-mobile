// app/painting-upload.tsx
import UnifiedHeader from "@/components/headers/UnifiedHeader";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { z } from "zod";

import { Colors } from "@/constants/theme";
import { useUploadPainting } from "../apis/painting";
import { useUserById } from "../apis/user";

/* ------------------------ Config & Schema ------------------------ */
const SIZE = 10; // MB
const MAX_FILE_SIZE = 1024 * 1024 * SIZE;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// ✳️ Màu thương hiệu (theo ảnh bạn cung cấp).
const BORDER_COLOR = "#dc5a54";

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
export type PaintingUploadForm = z.infer<typeof paintingUploadSchema>;

const { width: screenWidth } = Dimensions.get("window");

/* ------------------------ Styles Factory ------------------------ */
const createStyles = (C: any, scheme: "light" | "dark") =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: C.background,
    },
    contentScroll: { flex: 1 },
    contentInset: { padding: 20, paddingBottom: 32 },

    /* Headings */
    title: {
      fontSize: 24,
      fontWeight: "900",
      color: C.foreground,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 14,
      color: C.mutedForeground,
      marginBottom: 16,
    },

    /* ------ Featured Candidate Card (THÍ SINH) ------ */
    cardFeatured: {
      flexDirection: "row",
      borderRadius: 12,
      borderWidth: 2,
      borderColor: BORDER_COLOR,
      backgroundColor: C.card,
      marginBottom: 16,
      overflow: "hidden",
    },
    leftAccent: {
      width: 6,
      backgroundColor: BORDER_COLOR,
    },
    featuredInner: { flex: 1, padding: 14 },
    cardFeaturedHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    badgeStrong: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: BORDER_COLOR,
    },
    badgeStrongText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    userNameFeatured: {
      color: C.foreground,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: "900",
      marginTop: 4,
      marginBottom: 10,
    },
    pillRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    pillStrong: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: BORDER_COLOR,
    },
    pillStrongText: { color: "#fff", fontSize: 12.5, fontWeight: "700" },
    pillSoft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: BORDER_COLOR,
      backgroundColor: scheme === "dark" ? "rgba(255,255,255,0.05)" : "#F9FAFB",
    },
    pillSoftText: { color: C.foreground, fontSize: 12.5, fontWeight: "600" },

    /* ------ Generic Card ------ */
    card: {
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 16,
      borderWidth: 1,
      borderColor:
        scheme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.10)",
      backgroundColor: C.card,
    },
    cardInner: { padding: 16 },

    /* Labels */
    label: {
      fontSize: 14,
      fontWeight: "800",
      color: C.foreground,
      marginBottom: 10,
      textTransform: "uppercase",
    },

    /* Inputs */
    input: {
      borderWidth: 1.5,
      borderColor:
        scheme === "light" ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.16)",
      backgroundColor: scheme === "light" ? "#fff" : "rgba(255,255,255,0.04)",
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      fontSize: 16,
      color: C.foreground,
    },
    inputMultiline: { textAlignVertical: "top", minHeight: 120 },

    /* Upload area */
    uploadDrop: {
      borderWidth: 1.5,
      borderColor: BORDER_COLOR,
      borderStyle: "dashed",
      borderRadius: 12,
      padding: 20,
      alignItems: "center",
      backgroundColor: scheme === "light" ? "#fff" : "rgba(255,255,255,0.03)",
    },
    uploadTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: C.foreground,
      marginTop: 10,
    },
    uploadHint: {
      fontSize: 13,
      color: C.mutedForeground,
      marginTop: 6,
      textAlign: "center",
    },

    /* Image preview */
    imageFrame: {
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 1.5,
      borderColor:
        scheme === "light" ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.16)",
      backgroundColor: scheme === "light" ? "#fff" : "rgba(255,255,255,0.03)",
    },
    imagePreview: {
      width: "100%",
      height: screenWidth * 0.72,
      resizeMode: "cover",
    },
    chipBar: {
      position: "absolute",
      right: 10,
      top: 10,
      flexDirection: "row",
      gap: 8,
    },
    chip: {
      backgroundColor: "rgba(0,0,0,0.6)",
      padding: 8,
      borderRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,255,255,0.25)",
    },

    /* Submit */
    submitBtn: {
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 4,
      marginBottom: 22,
      backgroundColor: BORDER_COLOR,
    },
    submitText: {
      fontSize: 16,
      fontWeight: "900",
      color: "#ffffff",
      letterSpacing: 0.3,
    },
    submitDisabled: { opacity: 0.6 },

    /* Note */
    note: {
      borderRadius: 10,
      padding: 12,
      backgroundColor:
        scheme === "light" ? "#F9FAFB" : "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor:
        scheme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.10)",
    },
    noteText: {
      color: C.mutedForeground,
      fontSize: 12.5,
      textAlign: "center",
      lineHeight: 18,
    },

    /* Bottom Sheet Modal */
    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    sheetWrap: { width: "100%", alignSelf: "stretch" },
    sheet: {
      width: "100%",
      alignSelf: "stretch",
      backgroundColor: C.card,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: 6,
      paddingHorizontal: 16,
      paddingBottom: 10,
      borderWidth: 1,
      borderColor:
        scheme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.10)",
    },
    sheetDragArea: {
      alignItems: "center",
      paddingVertical: 10,
      marginBottom: 6,
    },
    sheetHandle: {
      width: 44,
      height: 4,
      borderRadius: 4,
      backgroundColor: scheme === "light" ? "#CBD5E1" : "#475569",
    },
    sheetTitle: {
      color: C.foreground,
      fontWeight: "900",
      fontSize: 17,
      textAlign: "center",
      marginBottom: 10,
    },
    sheetOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 10,
      marginBottom: 10,
      backgroundColor: scheme === "light" ? "#fff" : "rgba(255,255,255,0.03)",
      borderWidth: 1,
      borderColor:
        scheme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.10)",
    },
    sheetText: {
      color: C.foreground,
      fontSize: 15.5,
      marginLeft: 12,
      fontWeight: "800",
    },
  });

/* ------------------------ Component ------------------------ */
type PaintingUploadParams = {
  type: "COMPETITOR" | "GUARDIAN";
  contestId: string;
  competitorId: string;
  roundId: string;
};

export default function PaintingUpload() {
  const {
    type: _type,
    contestId,
    competitorId,
    roundId,
  } = useLocalSearchParams<PaintingUploadParams>();
  const scheme = (useColorScheme() ?? "dark") as "light" | "dark";
  const C = Colors[scheme];
  const s = createStyles(C, scheme);

  const { control, handleSubmit, formState } = useForm<PaintingUploadForm>({
    mode: "all",
    resolver: zodResolver(paintingUploadSchema),
  });
  const { data: currentUser, isLoading, isError } = useUserById(competitorId);
  const { mutate, isPending } = useUploadPainting();

  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);
  // Error State - now for general upload errors (non-AI-check)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [errorModalConfirmationInput, setErrorModalConfirmationInput] =
    useState("");
  const [isErrorModalConfirmed, setIsErrorModalConfirmed] = useState(false);

  // Use ref to track ignoreAiCheck flag synchronously (state update is async)
  const ignoreAiCheckRef = useRef(false);
  // Track if painting is flagged by AI (for subsequent uploads)
  const isFlaggedRef = useRef(false);

  useEffect(() => {
    console.log("🎨 [PAINTING UPLOAD] Component mounted - ready to upload", {
      contestId,
      competitorId,
      roundId,
      currentUser: currentUser?.id,
      timestamp: new Date().toISOString(),
    });
    return () => {
      console.log("🎨 [PAINTING UPLOAD] Component unmounted/cleaned up", {
        timestamp: new Date().toISOString(),
      });
    };
  }, []);

  const sheetAnim = useRef(new Animated.Value(0)).current;

  // Bottom sheet controls
  const showSheet = () => {
    setSheetOpen(true);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();
  };
  const hideSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setSheetOpen(false));
  };
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 16,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) sheetAnim.setValue(1 - g.dy / 320);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100) hideSheet();
        else
          Animated.spring(sheetAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
      },
    }),
  ).current;

  // Image actions
  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Thông báo",
          "Cần quyền truy cập thư viện ảnh để tải lên tranh vẽ",
          [
            { text: "Hủy", style: "cancel" },
            { text: "Mở cài đặt", onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        const file = result.assets[0];
        if (file.fileSize && file.fileSize > MAX_FILE_SIZE) {
          Alert.alert("Lỗi", `Kích thước ảnh không được vượt quá ${SIZE}MB`);
          return;
        }
        if (file.mimeType && !ACCEPTED_IMAGE_TYPES.includes(file.mimeType)) {
          Alert.alert("Lỗi", "Chỉ hỗ trợ: .jpg, .jpeg, .png, .webp");
          return;
        }
        console.log("🖼️ [PAINTING UPLOAD] Image selected from library:", {
          fileName: file.fileName,
          size: file.fileSize,
          type: file.mimeType,
          timestamp: new Date().toISOString(),
        });
        setImage(file);
        // Reset flagged state when selecting new image
        isFlaggedRef.current = false;
        resetAiCheckState();
      }
    } catch {
      Alert.alert("Lỗi", "Không thể tải ảnh. Vui lòng thử lại.");
    }
  };

  const takePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Thông báo",
          "Cần quyền truy cập camera để chụp ảnh tranh vẽ",
          [
            { text: "Hủy", style: "cancel" },
            { text: "Mở cài đặt", onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        const file = result.assets[0];
        if (file.fileSize && file.fileSize > MAX_FILE_SIZE) {
          Alert.alert("Lỗi", `Kích thước ảnh không được vượt quá ${SIZE}MB`);
          return;
        }
        if (file.mimeType && !ACCEPTED_IMAGE_TYPES.includes(file.mimeType)) {
          Alert.alert("Lỗi", "Chỉ hỗ trợ: .jpg, .jpeg, .png, .webp");
          return;
        }
        console.log("📸 [PAINTING UPLOAD] Photo taken from camera:", {
          fileName: file.fileName,
          size: file.fileSize,
          type: file.mimeType,
          timestamp: new Date().toISOString(),
        });
        setImage(file);
        // Reset flagged state when taking new photo
        isFlaggedRef.current = false;
        resetAiCheckState();
      }
    } catch {
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
    }
  };

  const removeImage = () => {
    console.log("🗑️ [PAINTING UPLOAD] Image removed", {
      timestamp: new Date().toISOString(),
    });
    setImage(null);
    // Also reset flagged state when removing image
    isFlaggedRef.current = false;
    resetAiCheckState();
  };

  const resetAiCheckState = () => {
    console.log("🔄 [PAINTING UPLOAD] Resetting error modal state", {
      timestamp: new Date().toISOString(),
    });
    setIsErrorModalOpen(false);
    setErrorModalConfirmationInput("");
    setErrorMessage("");
    setErrorTitle("");
  };

  const onSubmit = (data: PaintingUploadForm) => {
    if (!image) {
      Alert.alert("Thông báo", "Vui lòng chọn ảnh tranh vẽ để gửi bài thi");
      return;
    }

    // Use ref values to get current flags (synchronous)
    const ignoreAiCheckFlag = ignoreAiCheckRef.current;
    const isFlaggedFlag = isFlaggedRef.current;

    // Debug: log the refs before submitting
    console.log("📍 [PAINTING UPLOAD] Before submit - checking refs:", {
      ignoreAiCheckRef: ignoreAiCheckRef.current,
      isFlaggedRef: isFlaggedRef.current,
      timestamp: new Date().toISOString(),
    });

    // Reset all error states before new submission
    // This ensures each submit is fresh and independent
    setIsErrorModalOpen(false);
    setErrorMessage("");
    setErrorTitle("");
    setErrorModalConfirmationInput("");
    setIsErrorModalConfirmed(false);

    console.log("🎨 [PAINTING UPLOAD] Submitting painting...", {
      title: data.title,
      description: data.description,
      imageName: image.fileName,
      imageSize: image.fileSize,
      contestId,
      roundId,
      competitorId,
      ignoreAiCheck: ignoreAiCheckFlag,
      isFlagged: isFlaggedFlag,
      timestamp: new Date().toISOString(),
    });
    mutate(
      {
        title: data.title,
        description: data.description,
        file: {
          uri: image.uri,
          name: image.fileName ?? `Painting of ${currentUser?.fullName}`,
          type: image.mimeType ?? "image/jpeg",
        },
        contestId: String(contestId),
        roundId: String(roundId),
        competitorId: String(competitorId),
        // Send ignoreAiCheck using ref value (synchronous)
        ignoreAiCheck: ignoreAiCheckFlag,
        // Send isFlagged using ref value
        isFlagged: isFlaggedFlag,
      },
      {
        onSuccess: () => {
          console.log("✅ [PAINTING UPLOAD] Upload successful!", {
            title: data.title,
            flagged: isFlaggedFlag,
            timestamp: new Date().toISOString(),
          });
          Alert.alert("Thành công", "Đã gửi bài thi!", [
            { text: "OK", onPress: () => router.back() },
          ]);
          // Reset AI check state and error modal state after success
          resetAiCheckState();
          setIsErrorModalConfirmed(false);
          // Reset both flags after successful upload
          isFlaggedRef.current = false;
          ignoreAiCheckRef.current = false;
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Gửi bài thi thất bại, vui lòng thử lại.";

          console.log("❌ [PAINTING UPLOAD] Upload error:", {
            status: error?.response?.status,
            message: errorMessage,
            isFlagged: isFlaggedFlag,
            isAiCheckError: Boolean(
              error?.response?.status === 400 &&
              (errorMessage.toLowerCase().includes("ai") ||
                errorMessage.toLowerCase().includes("detect") ||
                errorMessage.toLowerCase().includes("phát hiện") ||
                errorMessage.toLowerCase().includes("vấn đề") ||
                errorMessage.toLowerCase().includes("kỹ thuật số") ||
                errorMessage.toLowerCase().includes("vector") ||
                errorMessage.toLowerCase().includes("không hợp lệ") ||
                errorMessage.toLowerCase().includes("sạch") ||
                errorMessage.toLowerCase().includes("tác phẩm")),
            ),
            timestamp: new Date().toISOString(),
          });

          // Check if this is an AI check failed error
          // AI check errors typically contain keywords related to AI detection, image quality, etc.
          const isAiCheckError =
            error?.response?.status === 400 &&
            (errorMessage.toLowerCase().includes("ai") ||
              errorMessage.toLowerCase().includes("detect") ||
              errorMessage.toLowerCase().includes("phát hiện") ||
              errorMessage.toLowerCase().includes("vấn đề") ||
              errorMessage.toLowerCase().includes("kỹ thuật số") ||
              errorMessage.toLowerCase().includes("vector") ||
              errorMessage.toLowerCase().includes("không hợp lệ") ||
              errorMessage.toLowerCase().includes("sạch") ||
              errorMessage.toLowerCase().includes("tác phẩm"));

          if (isAiCheckError && !isErrorModalOpen) {
            // First time AI check failed - mark painting as flagged
            console.log(
              "⚠️ [PAINTING UPLOAD] AI check failed - marking as flagged and showing error modal",
            );
            isFlaggedRef.current = true;
            console.log("📍 [PAINTING UPLOAD] isFlaggedRef SET to true:", {
              value: isFlaggedRef.current,
              timestamp: new Date().toISOString(),
            });
            setErrorTitle("AI Phát Hiện Tranh Có Vấn Đề");
            setErrorMessage(errorMessage);
            setIsErrorModalOpen(true);
            setErrorModalConfirmationInput("");
          } else {
            // Other errors - show error modal (not AI check)
            console.log(
              "⚠️ [PAINTING UPLOAD] General error - showing error modal",
            );
            setErrorTitle("Lỗi Nộp Bài");
            setErrorMessage(errorMessage);
            setErrorModalConfirmationInput("");
            setIsErrorModalConfirmed(false);
            setIsErrorModalOpen(true);
            // Reset AI check state when showing other errors
            resetAiCheckState();
          }
        },
      } as any,
    );
  };

  /* ------------------------ Loading/Guard ------------------------ */
  if (isLoading) {
    return (
      <View
        style={[
          { flex: 1, alignItems: "center", justifyContent: "center" },
          { backgroundColor: C.background },
        ]}
      >
        <ActivityIndicator size="large" color={BORDER_COLOR} />
        <Text style={{ color: C.mutedForeground, marginTop: 10 }}>
          Đang tải thông tin…
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          },
          { backgroundColor: C.background },
        ]}
      >
        <Text
          style={{ color: C.foreground, fontSize: 16, textAlign: "center" }}
        >
          Bạn cần đăng nhập trước khi có thể tham dự cuộc thi
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={[s.submitBtn, { marginTop: 16 }]}
        >
          <Text style={s.submitText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ------------------------ UI ------------------------ */
  return (
    <View style={s.screen}>
      <UnifiedHeader title="Bài vẽ dự thi" showBack={true} scheme={scheme} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={s.contentScroll}
          contentContainerStyle={s.contentInset}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.title}>Bài vẽ dự thi</Text>
          <Text style={s.subtitle}>
            Tải ảnh tác phẩm của bạn và điền thông tin bên dưới
          </Text>

          {/* USER CARD — FEATURED */}
          <View style={s.cardFeatured}>
            <View style={s.leftAccent} />
            <View style={s.featuredInner}>
              <View style={s.cardFeaturedHeader}>
                <View style={s.badgeStrong}>
                  <Text style={s.badgeStrongText}>THÍ SINH</Text>
                </View>
                <Ionicons
                  name="person-circle-outline"
                  size={30}
                  color={C.foreground}
                />
              </View>

              <Text style={s.userNameFeatured} numberOfLines={1}>
                {currentUser?.fullName}
              </Text>

              <View style={s.pillRow}>
                {!!currentUser?.schoolName && (
                  <View style={s.pillStrong}>
                    <Ionicons name="school-outline" size={16} color="#fff" />
                    <Text style={s.pillStrongText}>
                      {currentUser.schoolName}
                    </Text>
                  </View>
                )}
                {!!currentUser?.grade && (
                  <View style={s.pillSoft}>
                    <Ionicons
                      name="ribbon-outline"
                      size={16}
                      color={BORDER_COLOR}
                    />
                    <Text style={s.pillSoftText}>Lớp {currentUser.grade}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* TITLE */}
          <View style={s.card}>
            <View style={s.cardInner}>
              <Text style={s.label}>Tiêu đề tác phẩm *</Text>
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <TextInput
                    placeholder="Nhập tiêu đề cho tác phẩm của bạn"
                    placeholderTextColor={
                      scheme === "dark" ? "#94a3b8" : "#9aa5b1"
                    }
                    style={s.input}
                    maxLength={100}
                    value={field.value}
                    onChangeText={field.onChange}
                    cursorColor={BORDER_COLOR}
                    selectionColor="rgba(220,90,84,0.25)"
                  />
                )}
              />
              {formState.errors.title && (
                <Text
                  style={{ color: "#dc2626", fontSize: 12.5, marginTop: 8 }}
                >
                  {formState.errors.title.message}
                </Text>
              )}
            </View>
          </View>

          {/* DESCRIPTION */}
          <View style={s.card}>
            <View style={s.cardInner}>
              <Text style={s.label}>Mô tả (tùy chọn)</Text>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextInput
                    placeholder="Chia sẻ về tác phẩm, cảm hứng sáng tác…"
                    placeholderTextColor={
                      scheme === "dark" ? "#94a3b8" : "#9aa5b1"
                    }
                    style={[s.input, s.inputMultiline]}
                    multiline
                    numberOfLines={5}
                    maxLength={500}
                    value={field.value}
                    onChangeText={field.onChange}
                    cursorColor={BORDER_COLOR}
                    selectionColor="rgba(220,90,84,0.25)"
                  />
                )}
              />
            </View>
          </View>

          {/* IMAGE UPLOAD */}
          <View style={s.card}>
            <View style={s.cardInner}>
              <Text style={s.label}>Ảnh tác phẩm *</Text>
              {!image ? (
                <TouchableOpacity
                  style={s.uploadDrop}
                  onPress={() => {
                    console.log(
                      "🎨 [PAINTING UPLOAD] User clicked - Tải ảnh tranh vẽ",
                    );
                    showSheet();
                  }}
                >
                  <Ionicons
                    name="cloud-upload-outline"
                    size={44}
                    color={scheme === "dark" ? "#cbd5e1" : "#64748b"}
                  />
                  <Text style={s.uploadTitle}>Tải ảnh tranh vẽ</Text>
                  <Text style={s.uploadHint}>
                    Chọn ảnh từ thư viện hoặc chụp ảnh mới
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={s.imageFrame}>
                  <Image source={{ uri: image.uri }} style={s.imagePreview} />
                  <View style={s.chipBar}>
                    <TouchableOpacity onPress={removeImage} style={s.chip}>
                      <Ionicons name="close" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        console.log(
                          "📷 [PAINTING UPLOAD] User clicked chip camera button",
                        );
                        showSheet();
                      }}
                      style={s.chip}
                    >
                      <Ionicons name="camera" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* SUBMIT */}
          <TouchableOpacity
            onPress={() => {
              console.log(
                "✉️ [PAINTING UPLOAD] Submit button clicked - calling onSubmit",
              );
              handleSubmit(onSubmit)();
            }}
            disabled={isPending || !formState.isValid || !image}
            style={[
              s.submitBtn,
              (isPending || !formState.isValid || !image) && s.submitDisabled,
            ]}
          >
            <Text style={s.submitText}>
              {isPending ? "Đang gửi…" : "Gửi bài thi"}
            </Text>
          </TouchableOpacity>

          <View style={s.note}>
            <Text style={s.noteText}>
              Lưu ý: Sau khi gửi bài thi, bạn không thể chỉnh sửa. Vui lòng kiểm
              tra kỹ trước khi gửi.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Sheet */}
      <Modal
        visible={isSheetOpen}
        transparent
        animationType="none"
        onRequestClose={() => {
          console.log("📋 [PAINTING UPLOAD] Image picker sheet closed");
          hideSheet();
        }}
        statusBarTranslucent
      >
        <View style={s.modalContainer}>
          <TouchableWithoutFeedback onPress={hideSheet}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              s.sheetWrap,
              {
                transform: [
                  {
                    translateY: sheetAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [360, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={s.sheet}>
              <View style={s.sheetDragArea} {...panResponder.panHandlers}>
                <View style={s.sheetHandle} />
              </View>

              <Text style={s.sheetTitle}>Chọn ảnh</Text>

              <TouchableOpacity
                style={s.sheetOption}
                onPress={() => {
                  console.log(
                    "📚 [PAINTING UPLOAD] User clicked - Chọn từ thư viện",
                  );
                  hideSheet();
                  pickImage();
                }}
              >
                <Ionicons name="images" size={24} color={BORDER_COLOR} />
                <Text style={s.sheetText}>Chọn từ thư viện</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.sheetOption}
                onPress={() => {
                  console.log(
                    "📷 [PAINTING UPLOAD] User clicked - Chụp ảnh mới",
                  );
                  hideSheet();
                  takePhoto();
                }}
              >
                <Ionicons name="camera" size={24} color={BORDER_COLOR} />
                <Text style={s.sheetText}>Chụp ảnh mới</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.sheetOption}
                onPress={() => {
                  console.log(
                    "❌ [PAINTING UPLOAD] Image picker sheet - Hủy cancelled",
                  );
                  hideSheet();
                }}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={scheme === "dark" ? "#94a3b8" : "#64748b"}
                />
                <Text
                  style={[
                    s.sheetText,
                    { color: scheme === "dark" ? "#94a3b8" : "#64748b" },
                  ]}
                >
                  Hủy
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Error Modal (for non-AI-check errors) */}
      <Modal
        visible={isErrorModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          console.log("❌ [PAINTING UPLOAD] User dismissed error modal");
          setIsErrorModalOpen(false);
        }}
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: C.card,
              borderRadius: 16,
              padding: 20,
              marginHorizontal: 16,
              maxWidth: "90%",
            }}
          >
            {/* Header */}
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <Ionicons name="alert-circle" size={48} color={BORDER_COLOR} />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "900",
                  color: C.foreground,
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                {errorTitle}
              </Text>
            </View>

            {/* Error Message */}
            <Text
              style={{
                fontSize: 14,
                color: C.mutedForeground,
                marginBottom: 12,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              {errorMessage}
            </Text>

            {/* Confirm Question */}
            <Text
              style={{
                fontSize: 13,
                color: C.foreground,
                marginBottom: 16,
                textAlign: "center",
                lineHeight: 18,
                fontWeight: "600",
              }}
            >
              Bạn muốn vẫn gửi bài thi hiện tại hay chọn tranh khác để nộp lại?
            </Text>

            {/* Confirmation Input Label */}
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: C.foreground,
                marginBottom: 8,
              }}
            >
              Nhập{" "}
              <Text style={{ color: "hsl(15 85% 55%))", fontSize: 14 }}>
                GỬI BÀI THI
              </Text>{" "}
              để tiếp tục gửi bài thi hiện tại.
            </Text>

            {/* Confirmation Input */}
            <TextInput
              placeholder="GỬI BÀI THI"
              placeholderTextColor={scheme === "dark" ? "#94a3b8" : "#9aa5b1"}
              style={{
                borderWidth: 1.5,
                borderColor:
                  scheme === "light"
                    ? "rgba(0,0,0,0.14)"
                    : "rgba(255,255,255,0.16)",
                backgroundColor:
                  scheme === "light" ? "#fff" : "rgba(255,255,255,0.04)",
                borderRadius: 10,
                paddingVertical: 12,
                paddingHorizontal: 14,
                fontSize: 16,
                color: C.foreground,
                marginBottom: 16,
              }}
              value={errorModalConfirmationInput}
              onChangeText={setErrorModalConfirmationInput}
              cursorColor={BORDER_COLOR}
              selectionColor="rgba(220,90,84,0.25)"
            />

            {/* Buttons */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: BORDER_COLOR,
                  alignItems: "center",
                }}
                onPress={() => {
                  console.log(
                    "🔄 [PAINTING UPLOAD] User chose to reselect image",
                  );
                  ignoreAiCheckRef.current = false;
                  setIsErrorModalOpen(false);
                  setErrorModalConfirmationInput("");
                  setIsErrorModalConfirmed(false);
                  removeImage();
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: BORDER_COLOR,
                  }}
                >
                  Chọn Tranh Khác
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  {
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    backgroundColor: BORDER_COLOR,
                  },
                  (errorModalConfirmationInput !== "GỬI BÀI THI" ||
                    isPending) && {
                    opacity: 0.5,
                  },
                ]}
                disabled={
                  errorModalConfirmationInput !== "GỬI BÀI THI" || isPending
                }
                onPress={() => {
                  console.log(
                    "📝 [PAINTING UPLOAD] User confirmed error modal - retrying with ignoreAiCheck = true",
                  );
                  // Set refs immediately (synchronous) before submit - treat error as flagged
                  ignoreAiCheckRef.current = true;
                  isFlaggedRef.current = true; // ← Set flagged same as AI modal
                  console.log(
                    "📍 [PAINTING UPLOAD] Error modal confirm - Refs SET:",
                    {
                      ignoreAiCheckRef: ignoreAiCheckRef.current,
                      isFlaggedRef: isFlaggedRef.current,
                      timestamp: new Date().toISOString(),
                    },
                  );
                  setIsErrorModalOpen(false);
                  setErrorModalConfirmationInput("");
                  handleSubmit(onSubmit)();
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#fff",
                  }}
                >
                  Xác Nhận
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
