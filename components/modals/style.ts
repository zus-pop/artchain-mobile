import { Dimensions, StyleSheet } from "react-native";

const styles = (C: any) => {
  const { height: SCREEN_H } = Dimensions.get("window");
  const SNAP = { OPEN: 0, DISMISS: SCREEN_H };
  const DRAG_CLOSE_THRESHOLD = 120;
  const VELOCITY_CLOSE_THRESHOLD = 1.0;
  const FOOTER_H = 64;
  return StyleSheet.create({
    wrap: { flex: 1, justifyContent: "flex-end" },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.45)",
    },

    // bỏ viền bao; dùng shadow cho sang hơn
    sheet: {
      maxHeight: SCREEN_H * 0.9,
      backgroundColor: C.background,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      paddingHorizontal: 14, // gọn hơn
      paddingTop: 6,
      paddingBottom: 10,
      shadowColor: "#000",
      shadowOpacity: 0.14,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: -4 },
      elevation: 16,
    },

    grabberWrap: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 6,
    },
    grabber: {
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: C.border,
      opacity: 0.95,
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 2,
      paddingVertical: 8, // gọn
    },
    title: { fontSize: 18, fontWeight: "800", color: C.foreground },
    iconBtn: { padding: 6, marginRight: -6 },

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: C.border,
      opacity: 0.9,
      marginHorizontal: -14,
    },

    // INFO block — nổi bật
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10, // gọn
    },
    avatarRing: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: C.card,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
      borderWidth: 2,
      borderColor: C.primary, // viền primary làm nổi
    },
    avatar: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: C.muted,
    },

    name: { fontSize: 18, fontWeight: "900", color: C.foreground },
    handle: { color: C.mutedForeground, marginTop: 2, fontSize: 12 },

    followChip: {
      marginTop: 6,
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: C.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
    },
    followTxt: { color: C.primary, fontWeight: "700", fontSize: 12 },

    sectionTight: { paddingVertical: 6 }, // section gọn

    sectionTitle: { fontWeight: "800", color: C.foreground, marginBottom: 4 },

    actionsRow: { flexDirection: "row", gap: 10, marginTop: 8 },

    footer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: FOOTER_H,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
      // nhẹ nhàng nổi lên
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: -2 },
      elevation: 3,
    },
    primaryBtn: {
      flex: 1,
      borderRadius: 12,
      overflow: "hidden",
    },
    primaryTxt: {
      textAlign: "center",
      fontWeight: "700",
      paddingVertical: 12,
      borderRadius: 12,
    },
    ghostBtn: {
      flex: 1,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: "center",
      justifyContent: "center",
    },
    ghostTxt: {
      fontWeight: "700",
      paddingVertical: 12,
      width: "100%",
      textAlign: "center",
      borderRadius: 12,
    },
    camBtn: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontWeight: "600",
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "600",
    opacity: 0.8,
  },
  err: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: "600",
  },
  handleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  });
};

export default styles;
