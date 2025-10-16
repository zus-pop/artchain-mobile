import { Colors } from "@/constants/theme";
import { Dimensions, StyleSheet } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export type PaintingColors = {
  background: string;
  card: string;
  border: string;
  foreground: string;
  mutedForeground: string;
  input: string;
  muted: string;
  primary: string;
  primaryForeground: string;
};

export const getPaintingColors = (
  colorScheme: "light" | "dark"
): PaintingColors => {
  const c = Colors[colorScheme];
  return {
    background: c.background,
    card: c.card,
    border: c.border,
    foreground: c.foreground,
    mutedForeground: c.mutedForeground,
    input: c.input,
    muted: c.muted,
    primary: c.primary,
    primaryForeground: c.primaryForeground,
  };
};

export const createUploadPaintingStyles = (colors: PaintingColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    scrollContainer: { flex: 1 },
    scrollContent: { padding: 15 },

    pageTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.foreground,
      textAlign: "center",
      marginBottom: 20,
    },

    // User Info
    userInfoCard: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 8,
      paddingVertical: 12,
      marginBottom: 24,
      borderWidth: 1.2,
      borderColor: colors.border,
    },
    userInfoLabel: {
      fontSize: 14,
      fontWeight: "400",
      color: colors.mutedForeground,
      marginBottom: 4,
    },
    userInfoName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.foreground,
      marginBottom: 2,
    },
    userInfoDetail: {
      fontSize: 14,
      fontWeight: "400",
      color: colors.mutedForeground,
    },
    userInfoDetailLast: {
      fontSize: 14,
      fontWeight: "400",
      color: colors.mutedForeground,
    },

    // Inputs
    inputSection: { marginBottom: 20 },
    inputSectionLarge: { marginBottom: 24 },

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
      borderWidth: 1.2,
      borderColor: colors.border,
      backgroundColor: colors.input,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.foreground,
      textAlignVertical: "top",
      minHeight: 100,
    },

    errorText: { color: "#EF4444", fontSize: 12, marginTop: 4 },

    // Upload
    uploadSection: { marginBottom: 32 },
    uploadArea: {
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: "dashed",
      borderRadius: 12,
      padding: 32,
      alignItems: "center",
      backgroundColor: colors.muted + "20",
    },
    uploadIcon: { marginBottom: 12 },
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
    imageRemoveButton: { position: "absolute", top: 8, right: 8 },
    imageEditButton: { position: "absolute", bottom: 8, right: 8 },

    // Submit
    submitButton: {
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginBottom: 20,
    },
    submitButtonText: { fontSize: 16, fontWeight: "600" },

    // Note
    infoNote: { borderRadius: 8, padding: 12, marginBottom: 30 },
    infoNoteText: { fontSize: 12, textAlign: "center", lineHeight: 16 },

    // Bottom sheet
    bottomSheetOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    bottomSheetContainer: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 40,
      maxHeight: "40%",
    },
    bottomSheetHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.mutedForeground,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 20,
    },
    bottomSheetTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.foreground,
      textAlign: "center",
      marginBottom: 24,
    },
    bottomSheetOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: colors.muted + "20",
    },
    bottomSheetOptionText: {
      fontSize: 16,
      color: colors.foreground,
      marginLeft: 12,
      fontWeight: "500",
    },
  });
