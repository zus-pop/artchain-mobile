import type { ColorTokens } from "@/types/tabkey";
import { Dimensions, Platform, StyleSheet } from "react-native";

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_MAX_H = Math.min(SCREEN_H * 0.92, 720);

const toAlpha = (hex: string, a: number) => {
  if (!hex) return `rgba(0,0,0,${a})`;
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

export default function styles(C: ColorTokens) {
  return StyleSheet.create({
    wrap: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(2,6,23,0.55)",
    },
    sheet: {
      maxHeight: SHEET_MAX_H,
      backgroundColor: C.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: toAlpha(C.border as string, 0.6),
      shadowColor: "#000",
      shadowOpacity: 0.18,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: -2 },
      ...Platform.select({ android: { elevation: 10 } }),
    },

    grabberWrap: { alignItems: "center", paddingTop: 6, paddingBottom: 6 },
    grabber: {
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: toAlpha("#000000", 0.15),
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    title: { fontSize: 16, fontWeight: "900", color: C.foreground, flex: 1 },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: toAlpha("#ffffff", 0.9),
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: toAlpha(C.border as string, 0.8),
    },

    // CONTENT
    sectionTight: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 6 },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    avatarRing: {
      width: 86,
      height: 86,
      borderRadius: 43,
      position: "relative",
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      ...Platform.select({ android: { elevation: 3 } }),
    },
    avatar: {
      position: "absolute",
      left: 5,
      top: 5,
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 3,
      borderColor: "#fff",
      overflow: "hidden",
      ...Platform.select({ android: { elevation: 2 } }),
    },

    // FOOTER
    footer: {
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryBtn: {
      borderRadius: 12,
      overflow: "hidden",
      minWidth: 160,
    },
    primaryTxt: {
      fontWeight: "900",
      paddingHorizontal: 16,
      paddingVertical: 10,
      textAlign: "center",
      borderRadius: 12,
    },
    ghostBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: toAlpha(C.border as string, 0.7),
      backgroundColor: toAlpha("#fff", 0.65),
    },
    ghostTxt: { fontWeight: "900" },
  });
}
