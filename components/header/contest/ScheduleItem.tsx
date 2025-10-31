// components/contest/ScheduleItem.tsx
import { Colors } from "@/constants/theme";
import { CalendarDays, Clock, Gift, PlayCircle } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Kind = "open" | "deadline" | "review" | "award";

export default function ScheduleItem({
  scheme = "light",
  label,
  date,
  kind,
}: {
  scheme?: "light" | "dark";
  label: string;
  date: string;
  kind: Kind;
}) {
  const C = Colors[scheme];
  const { Icon, color } = pick(kind, C);

  return (
    <View style={s(C).row}>
      <Icon size={16} color={color} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={[s(C).label, { color }]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={s(C).date} numberOfLines={2}>
          {date}
        </Text>
      </View>
    </View>
  );
}

function pick(kind: Kind, C: any) {
  switch (kind) {
    case "open":
      return { Icon: PlayCircle, color: C.chart2 ?? "#22C55E" };
    case "deadline":
      return { Icon: CalendarDays, color: C.accent ?? "#EF4444" };
    case "review":
      return { Icon: Clock, color: C.primary };
    case "award":
      return { Icon: Gift, color: C.chart1 ?? "#F59E0B" };
    default:
      return { Icon: CalendarDays, color: C.mutedForeground };
  }
}

const s = (C: typeof Colors.light) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      gap: 10,
      paddingVertical: 6,
      paddingHorizontal: 2,
      alignItems: "flex-start",
    },
    label: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.2,
      marginBottom: 2,
      opacity: 0.95,
    },
    date: { fontSize: 14.5, color: C.cardForeground, fontWeight: "700" },
  });
