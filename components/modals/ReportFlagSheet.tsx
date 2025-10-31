// components/modals/ReportFlagSheet.tsx
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  reasons: string[];
  selected: string[];
  onToggle: (r: string) => void;
  note: string;
  onChangeNote: (v: string) => void;
  onSubmit: () => void;
};

const colorForReason = (reason: string) => {
  if (reason.includes("sao chép")) return "#f59e0b"; // amber
  if (reason.includes("nhạy cảm")) return "#ef4444"; // red
  if (reason.includes("chủ đề")) return "#3b82f6"; // blue
  if (reason.includes("lứa tuổi")) return "#22c55e"; // green
  if (reason.includes("phản cảm")) return "#a855f7"; // purple
  return "#0ea5e9"; // sky
};

const iconForReason = (reason: string) => {
  if (reason.includes("sao chép")) return "copy-outline";
  if (reason.includes("nhạy cảm")) return "warning-outline";
  if (reason.includes("chủ đề")) return "pricetag-outline";
  if (reason.includes("lứa tuổi")) return "accessibility-outline";
  if (reason.includes("phản cảm")) return "ban-outline";
  return "alert-circle-outline";
};

const ReportFlagSheet: React.FC<Props> = ({
  visible,
  onClose,
  reasons,
  selected,
  onToggle,
  note,
  onChangeNote,
  onSubmit,
}) => {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? "light"];
  const glassBg =
    scheme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles(colors).backdrop} onPress={onClose} />
      <View style={[styles(colors).sheet, { backgroundColor: colors.card }]}>
        <View style={styles(colors).sheetHeader}>
          <Ionicons name="flag" size={18} color={colors.primary} />
          <ThemedText style={styles(colors).sheetTitle}>
            Báo cáo vi phạm
          </ThemedText>
        </View>

        <View style={{ gap: 8, marginTop: 6 }}>
          {reasons.map((r) => {
            const active = selected.includes(r);
            const tint = colorForReason(r);
            const icon = iconForReason(r) as any;
            return (
              <Pressable
                key={r}
                onPress={() => onToggle(r)}
                style={[
                  styles(colors).reasonRow,
                  { backgroundColor: glassBg },
                  active && {
                    borderColor: tint,
                    shadowColor: tint,
                    shadowOpacity: 0.16,
                    shadowRadius: 8,
                    elevation: 3,
                  },
                ]}
              >
                <View
                  style={[
                    styles(colors).iconBadge,
                    { borderColor: tint, backgroundColor: `${tint}22` },
                  ]}
                >
                  <Ionicons name={icon} size={16} color={tint} />
                </View>
                <ThemedText style={{ flex: 1, color: colors.foreground }}>
                  {r}
                </ThemedText>
                <Ionicons
                  name={active ? "checkbox" : "square-outline"}
                  size={20}
                  color={active ? tint : colors.mutedForeground}
                />
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles(colors).noteBox,
            { backgroundColor: colors.input, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="create-outline"
            size={18}
            color={colors.mutedForeground}
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Ghi chú ngắn (tuỳ chọn)"
            value={note}
            onChangeText={onChangeNote}
            style={{ color: colors.foreground, paddingVertical: 8, flex: 1 }}
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        <View style={styles(colors).sheetActions}>
          <TouchableOpacity
            onPress={onClose}
            style={styles(colors).sheetBtnGhost}
          >
            <ThemedText
              style={{ color: colors.mutedForeground, fontWeight: "700" }}
            >
              Đóng
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSubmit}
            style={[
              styles(colors).sheetBtnPrimary,
              { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <ThemedText style={{ color: "#fff", fontWeight: "800" }}>
              Xác nhận
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ReportFlagSheet;

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
    sheet: {
      position: "absolute",
      left: 12,
      right: 12,
      bottom: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 6,
    },
    sheetTitle: { fontSize: 16, fontWeight: "800", color: colors.foreground },

    reasonRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 12,
    },
    iconBadge: {
      width: 26,
      height: 26,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },

    noteBox: {
      borderWidth: 1,
      borderRadius: 12,
      marginTop: 10,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    sheetActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 12,
    },
    sheetBtnGhost: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.input,
    },
    sheetBtnPrimary: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
    },
  });
