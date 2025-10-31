import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TabItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};
type Props = {
  tabs: TabItem[];
  activeKey: string;
  onChange: (k: string) => void;
  pickGrad: (seed?: string) => [string, string];
  cardBg?: string;
  mutedFg?: string;
  rounded?: number;
  height?: number;
};

export default function SegmentedTabsProfile({
  tabs,
  activeKey,
  onChange,
  pickGrad,
  cardBg = "#fff",
  mutedFg = "#6b7280",
  rounded = 12,
  height = 48,
}: Props) {
  return (
    <View style={[s.wrap, { borderRadius: rounded, height }]}>
      {tabs.map((t) => {
        const active = activeKey === t.key;
        const [g0, g1] = pickGrad(t.key);
        return (
          <TouchableOpacity
            key={t.key}
            style={[s.tab, active ? s.active : { backgroundColor: cardBg }]}
            onPress={() => onChange(t.key)}
            activeOpacity={0.9}
          >
            {active ? (
              <LinearGradient
                colors={[g0, g1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.iconGrad}
              >
                <Ionicons name={t.icon} size={16} color="#fff" />
              </LinearGradient>
            ) : (
              <View style={[s.icon, { backgroundColor: cardBg }]}>
                <Ionicons name={t.icon} size={16} color={mutedFg} />
              </View>
            )}
            <Text
              style={[s.lbl, active && { color: "#111", fontWeight: "700" }]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  active: { backgroundColor: "rgba(0,0,0,0.06)" },
  iconGrad: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  lbl: { fontSize: 14, color: "#6b7280", fontWeight: "600" },
});
