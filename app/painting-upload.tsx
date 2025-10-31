// app/painting-upload.tsx
import AppHeader from "@/components/AppHeader";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
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
      },
      {
        onSuccess: () => {
          Alert.alert("Thành công", "Đã gửi bài thi!", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: () => {
          Alert.alert("Lỗi", "Gửi bài thi thất bại, vui lòng thử lại.");
        },
      } as any // tuỳ hook của bạn; xoá `as any` nếu type hỗ trợ
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
      <AppHeader
        title="Bài vẽ dự thi"
        backgroundColor={BORDER_COLOR}
        borderBottom
      />

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
                <TouchableOpacity style={s.uploadDrop} onPress={showSheet}>
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
                    <TouchableOpacity onPress={showSheet} style={s.chip}>
                      <Ionicons name="camera" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* SUBMIT */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
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
        onRequestClose={hideSheet}
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
                  hideSheet();
                  takePhoto();
                }}
              >
                <Ionicons name="camera" size={24} color={BORDER_COLOR} />
                <Text style={s.sheetText}>Chụp ảnh mới</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.sheetOption} onPress={hideSheet}>
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
    </View>
  );
}
