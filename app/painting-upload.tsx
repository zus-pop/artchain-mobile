// app/painting-upload.tsx
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
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

const BG_IMAGE = require("@/assets/images/banner/bannerUpload.jpg");

const SIZE = 10; // MB
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
export type PaintingUploadForm = z.infer<typeof paintingUploadSchema>;

const { width: screenWidth } = Dimensions.get("window");

/* ---------- Colors & Styles ---------- */
const getColorScheme = (scheme: "light" | "dark") => {
  const themed = Colors[scheme];
  return {
    background: themed.background,
    foreground: themed.foreground,
    card: themed.card,
    border: themed.border,
    input: themed.input,
    muted: themed.muted,
    mutedForeground: themed.mutedForeground,
    primary: "#22d3ee",
    primaryForeground: "#ffffff",
    accent: "#38bdf8",
  };
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    gradient: { ...StyleSheet.absoluteFillObject },

    contentScroll: { flex: 1 },
    contentInset: { padding: 20, paddingBottom: 32 },

    /* Headings */
    title: {
      fontSize: 28,
      fontWeight: "900",
      color: colors.primaryForeground,
      textAlign: "center",
      letterSpacing: 0.6,
      marginBottom: 12,
      textShadowColor: "rgba(0,0,0,0.35)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    subtitle: {
      fontSize: 14,
      color: "#e2e8f0",
      textAlign: "center",
      marginBottom: 20,
      opacity: 0.95,
      letterSpacing: 0.2,
    },

    /* Card container */
    card: {
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 18,
      borderWidth: 1.8,
      borderColor: "rgba(255,255,255,0.32)",
      backgroundColor: "rgba(10,10,12,0.38)",
      shadowColor: "#000",
      shadowOpacity: 0.38,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    cardInner: { padding: 18 },

    /* Labels */
    label: {
      fontSize: 15,
      fontWeight: "900",
      color: "#f1f5f9",
      marginBottom: 10,
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },

    /* Inputs */
    input: {
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.42)",
      backgroundColor: "rgba(0,0,0,0.28)",
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 14,
      fontSize: 17,
      color: "#fff",
      shadowColor: "#000",
      shadowOpacity: 0.28,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    inputMultiline: { textAlignVertical: "top", minHeight: 120 },

    /* Upload area */
    uploadDrop: {
      borderWidth: 2.2,
      borderColor: "rgba(255,255,255,0.42)",
      borderStyle: "dashed",
      borderRadius: 18,
      padding: 28,
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.22)",
      shadowColor: "#000",
      shadowOpacity: 0.28,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    uploadTitle: {
      fontSize: 17,
      fontWeight: "900",
      color: "#fff",
      marginTop: 10,
      letterSpacing: 0.35,
    },
    uploadHint: {
      fontSize: 13,
      color: "#cbd5e1",
      marginTop: 6,
      letterSpacing: 0.2,
    },

    /* Image preview */
    imageFrame: {
      borderRadius: 18,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.42)",
      backgroundColor: "rgba(0,0,0,0.18)",
      shadowColor: "#000",
      shadowOpacity: 0.32,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    imagePreview: {
      width: "100%",
      height: screenWidth * 0.72,
      resizeMode: "cover",
    },
    chipBar: {
      position: "absolute",
      right: 12,
      top: 12,
      flexDirection: "row",
      gap: 10,
    },
    chip: {
      backgroundColor: "rgba(0,0,0,0.7)",
      padding: 9,
      borderRadius: 24,
      borderWidth: 1.4,
      borderColor: "rgba(255,255,255,0.38)",
    },

    /* Submit */
    submitBtn: {
      borderRadius: 18,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 10,
      marginBottom: 26,
      backgroundColor: colors.primary,
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
      borderWidth: 1.6,
      borderColor: "rgba(255,255,255,0.42)",
    },
    submitText: {
      fontSize: 17,
      fontWeight: "900",
      color: colors.primaryForeground,
      letterSpacing: 0.35,
    },
    submitDisabled: { backgroundColor: "rgba(255,255,255,0.25)" },

    /* Note */
    note: {
      borderRadius: 14,
      padding: 14,
      backgroundColor: "rgba(0,0,0,0.28)",
      borderWidth: 1.6,
      borderColor: "rgba(255,255,255,0.32)",
    },
    noteText: {
      color: "#e2e8f0",
      fontSize: 12,
      textAlign: "center",
      lineHeight: 18,
    },

    /* User card specifics */
    userHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    userTitle: {
      color: "#f8fafc",
      fontSize: 15,
      fontWeight: "900",
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },
    userName: {
      color: "#fff",
      fontSize: 20,
      fontWeight: "900",
      letterSpacing: 0.2,
      marginBottom: 8,
    },
    pillRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: "rgba(0,0,0,0.35)",
      borderWidth: 1.4,
      borderColor: "rgba(255,255,255,0.28)",
    },
    pillText: {
      color: "#e2e8f0",
      fontSize: 12.5,
      fontWeight: "700",
      letterSpacing: 0.2,
    },

    /* Bottom Sheet Modal */
    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.6)",
    },
    sheetWrap: { width: "100%", alignSelf: "stretch" },
    sheet: {
      width: "100%",
      alignSelf: "stretch",
      backgroundColor: "#0b1220",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 8,
      paddingHorizontal: 20,
      paddingBottom: 2,
      maxHeight: "100%",
      borderWidth: 1.8,
      borderColor: "rgba(255,255,255,0.24)",
      shadowColor: "#000",
      shadowOpacity: 0.4,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: -8 },
      elevation: 16,
    },
    sheetDragArea: {
      alignItems: "center",
      paddingVertical: 12,
      marginBottom: 10,
    },
    sheetHandle: {
      width: 60,
      height: 5,
      borderRadius: 3,
      backgroundColor: "#475569",
    },
    sheetTitle: {
      color: "#fff",
      fontWeight: "900",
      fontSize: 19,
      textAlign: "center",
      marginBottom: 20,
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },
    sheetOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 14,
      borderRadius: 16,
      marginBottom: 12,
      backgroundColor: "rgba(255,255,255,0.08)",
      borderWidth: 1.8,
      borderColor: "rgba(255,255,255,0.2)",
    },
    sheetText: {
      color: "#fff",
      fontSize: 16.5,
      marginLeft: 12,
      fontWeight: "800",
      letterSpacing: 0.25,
    },
  });

/* ---------- Component ---------- */
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
  const colors = getColorScheme(scheme);
  const styles = createStyles(colors);

  const { control, handleSubmit, formState } = useForm<PaintingUploadForm>({
    mode: "all",
    resolver: zodResolver(paintingUploadSchema),
  });
  const { data: currentUser, isLoading, isError } = useUserById(competitorId);
  const { mutate, isPending } = useUploadPainting();

  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  // Bottom sheet controls
  const showSheet = () => {
    setSheetOpen(true);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  };
  const hideSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 260,
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
        if (g.dy > 100) {
          hideSheet();
        } else {
          Animated.spring(sheetAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }
      },
    })
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
          ]
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
        setImage(file);
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
          ]
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
        setImage(file);
      }
    } catch {
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
    }
  };

  const removeImage = () => setImage(null);

  const onSubmit = (data: PaintingUploadForm) => {
    if (!image) {
      Alert.alert("Thông báo", "Vui lòng chọn ảnh tranh vẽ để gửi bài thi");
      return;
    }
    mutate({
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
    });
  };

  /* ---------- Loading/Guard ---------- */
  if (isLoading) {
    return (
      <ImageBackground source={BG_IMAGE} style={{ flex: 1 }}>
        <LinearGradient
          colors={[
            "rgba(7,13,22,0.20)", // ↓ từ 0.86
            "rgba(7,13,22,0.28)", // ↓ từ 0.72
            "rgba(7,13,22,0.24)", // ↓ từ 0.90
          ]}
          style={styles.gradient}
        />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: "#fff", marginTop: 10 }}>
            Đang tải thông tin…
          </Text>
        </View>
      </ImageBackground>
    );
  }

  if (isError) {
    return (
      <ImageBackground source={BG_IMAGE} style={{ flex: 1 }}>
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.8)"]}
          style={styles.gradient}
        />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, textAlign: "center" }}>
            Bạn cần đăng nhập trước khi có thể tham dự cuộc thi
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/login")}
            style={[styles.submitBtn, { marginTop: 20 }]}
          >
            <Text style={styles.submitText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  /* ---------- UI ---------- */
  return (
    <ImageBackground source={BG_IMAGE} style={styles.container}>
      <LinearGradient
        style={styles.gradient}
        colors={[
          "rgba(7,13,22,0.86)",
          "rgba(7,13,22,0.72)",
          "rgba(7,13,22,0.9)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentInset}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Bài vẽ dự thi</Text>
          <Text style={styles.subtitle}>
            Tải ảnh tác phẩm của bạn và điền thông tin bên dưới
          </Text>

          {/* USER CARD */}
          <View className="user-card" style={styles.card}>
            <BlurView intensity={2} tint="dark" style={styles.cardInner}>
              <View style={styles.userHeader}>
                <Text style={styles.userTitle}>Thí sinh</Text>
                <Ionicons
                  name="person-circle-outline"
                  size={32}
                  color="#e2e8f0"
                />
              </View>
              <Text style={styles.userName}>{currentUser?.fullName}</Text>
              <View style={styles.pillRow}>
                {!!currentUser?.schoolName && (
                  <View style={styles.pill}>
                    <Ionicons
                      name="school-outline"
                      size={16}
                      color={colors.accent}
                    />
                    <Text style={styles.pillText}>
                      {currentUser.schoolName}
                    </Text>
                  </View>
                )}
                {!!currentUser?.grade && (
                  <View style={styles.pill}>
                    <Ionicons
                      name="ribbon-outline"
                      size={16}
                      color={colors.accent}
                    />
                    <Text style={styles.pillText}>Lớp {currentUser.grade}</Text>
                  </View>
                )}
              </View>
            </BlurView>
          </View>

          {/* TITLE */}
          <View style={styles.card}>
            <BlurView intensity={28} tint="dark" style={styles.cardInner}>
              <Text style={styles.label}>Tiêu đề tác phẩm *</Text>
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <TextInput
                    placeholder="Nhập tiêu đề cho tác phẩm của bạn"
                    placeholderTextColor="#94a3b8"
                    style={styles.input}
                    maxLength={100}
                    value={field.value}
                    onChangeText={field.onChange}
                    cursorColor={colors.primary}
                    selectionColor="rgba(34,211,238,0.35)"
                  />
                )}
              />
              {formState.errors.title && (
                <Text
                  style={{ color: "#fecaca", fontSize: 12.5, marginTop: 8 }}
                >
                  {formState.errors.title.message}
                </Text>
              )}
            </BlurView>
          </View>

          {/* DESCRIPTION */}
          <View style={styles.card}>
            <BlurView intensity={28} tint="dark" style={styles.cardInner}>
              <Text style={styles.label}>Mô tả (tùy chọn)</Text>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextInput
                    placeholder="Chia sẻ về tác phẩm, cảm hứng sáng tác…"
                    placeholderTextColor="#94a3b8"
                    style={[styles.input, styles.inputMultiline]}
                    multiline
                    numberOfLines={5}
                    maxLength={500}
                    value={field.value}
                    onChangeText={field.onChange}
                    cursorColor={colors.primary}
                    selectionColor="rgba(34,211,238,0.35)"
                  />
                )}
              />
            </BlurView>
          </View>

          {/* IMAGE UPLOAD */}
          <View style={styles.card}>
            <BlurView intensity={28} tint="dark" style={styles.cardInner}>
              <Text style={styles.label}>Ảnh tác phẩm *</Text>
              {!image ? (
                <TouchableOpacity style={styles.uploadDrop} onPress={showSheet}>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={52}
                    color="#cbd5e1"
                  />
                  <Text style={styles.uploadTitle}>Tải ảnh tranh vẽ</Text>
                  <Text style={styles.uploadHint}>
                    Chọn ảnh từ thư viện hoặc chụp ảnh mới
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.imageFrame}>
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.imagePreview}
                  />
                  <View style={styles.chipBar}>
                    <TouchableOpacity onPress={removeImage} style={styles.chip}>
                      <Ionicons name="close" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={showSheet} style={styles.chip}>
                      <Ionicons name="camera" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </BlurView>
          </View>

          {/* SUBMIT */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isPending || !formState.isValid || !image}
            style={[
              styles.submitBtn,
              (isPending || !formState.isValid || !image) &&
                styles.submitDisabled,
            ]}
          >
            <Text style={styles.submitText}>
              {isPending ? "Đang gửi…" : "Gửi bài thi"}
            </Text>
          </TouchableOpacity>

          <View style={styles.note}>
            <Text style={styles.noteText}>
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
        onRequestClose={hideSheet}
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          {/* Backdrop click-to-close (full-screen) */}
          <TouchableWithoutFeedback onPress={hideSheet}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          {/* Sheet */}
          <Animated.View
            style={[
              styles.sheetWrap,
              {
                transform: [
                  {
                    translateY: sheetAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [380, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.sheet}>
              <View style={styles.sheetDragArea} {...panResponder.panHandlers}>
                <View style={styles.sheetHandle} />
              </View>

              <Text style={styles.sheetTitle}>Chọn ảnh</Text>

              <TouchableOpacity
                style={styles.sheetOption}
                onPress={() => {
                  hideSheet();
                  pickImage();
                }}
              >
                <Ionicons name="images" size={26} color={colors.primary} />
                <Text style={styles.sheetText}>Chọn từ thư viện</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetOption}
                onPress={() => {
                  hideSheet();
                  takePhoto();
                }}
              >
                <Ionicons name="camera" size={26} color={colors.primary} />
                <Text style={styles.sheetText}>Chụp ảnh mới</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sheetOption} onPress={hideSheet}>
                <Ionicons name="close" size={26} color="#94a3b8" />
                <Text style={[styles.sheetText, { color: "#94a3b8" }]}>
                  Hủy
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ImageBackground>
  );
}
