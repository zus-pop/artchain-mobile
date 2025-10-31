import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export type AchievementItem = { id: string; title: string; place: string };

export default function AchievementCard({
  item,
  pickGrad,
  borderColor = "#eee",
}: {
  item: AchievementItem;
  pickGrad: (seed?: string) => [string, string];
  borderColor?: string;
}) {
  const [g0, g1] = pickGrad(item.id);
  return (
    <View style={[s.card, { borderColor }]}>
      <LinearGradient
        colors={[g0, g1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.iconGrad}
      >
        <Ionicons name="trophy" size={20} color="#fff" />
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{item.title}</Text>
        <Text style={s.place}>{item.place}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconGrad: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  place: { fontSize: 13, opacity: 0.8 },
});
