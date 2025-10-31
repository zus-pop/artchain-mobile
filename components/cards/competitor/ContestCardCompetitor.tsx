import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type ContestItem = {
  id: string;
  title: string;
  progress: number;
  deadline: string;
  totalRounds: number;
  currentRound: number;
  submitted: boolean;
};

export default function ContestCardCompetitor({
  item,
  borderColor = "#eee",
  pickGrad,
  mutedFg = "#6b7280",
  onPressSubmit,
}: {
  item: ContestItem;
  borderColor?: string;
  pickGrad: (seed?: string) => [string, string];
  mutedFg?: string;
  onPressSubmit?: (c: ContestItem) => void;
}) {
  const [g0, g1] = pickGrad(item.title);
  return (
    <View style={[s.card, { borderColor }]}>
      <LinearGradient
        colors={[g0, g1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.topGrad}
      />
      <View style={s.header}>
        <Text style={s.title}>{item.title}</Text>
        <View style={s.progress}>
          <Text style={s.progressText}>{item.progress}%</Text>
        </View>
      </View>
      <View style={s.metaRow}>
        <View style={s.metaChip}>
          <Ionicons name="calendar-outline" size={14} color={mutedFg} />
          <Text style={[s.metaTxt, { color: mutedFg }]}>
            Hạn: {item.deadline}
          </Text>
        </View>
        <View style={s.metaChip}>
          <Ionicons name="trophy-outline" size={14} color={mutedFg} />
          <Text style={[s.metaTxt, { color: mutedFg }]}>
            Vòng {item.currentRound}/{item.totalRounds}
          </Text>
        </View>
      </View>
      <View style={s.actions}>
        <TouchableOpacity
          style={[s.actionBtn, item.submitted && s.submittedBtn]}
          onPress={() => !item.submitted && onPressSubmit?.(item)}
          activeOpacity={0.9}
        >
          <Ionicons
            name={item.submitted ? "checkmark-circle" : "add-circle"}
            size={16}
            color={item.submitted ? "#fff" : "#111"}
          />
          <Text style={[s.actionTxt, item.submitted && { color: "#fff" }]}>
            {item.submitted ? "Đã nộp" : "Nộp bài"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  topGrad: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 6,
    opacity: 0.9,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: "700" },
  progress: {
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  progressText: { fontSize: 12, fontWeight: "700" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metaChip: { flexDirection: "row", alignItems: "center" },
  metaTxt: { marginLeft: 4, fontSize: 12 },
  actions: { flexDirection: "row", justifyContent: "flex-end" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  submittedBtn: { backgroundColor: "#111" },
  actionTxt: { marginLeft: 6, fontSize: 14, fontWeight: "600" },
});
