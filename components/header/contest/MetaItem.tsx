// components/header/contest/MetaItem.tsx
import { Colors } from "@/constants/theme";
import {
  Award,
  Building2,
  CalendarDays,
  MapPin,
  Users,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Kind = "date" | "participants" | "organizer" | "location" | "prize";

type Props = {
  scheme: "light" | "dark";
  kind: Kind;
  value: string | number | null | undefined;
  tint?: string;
  iconStroke?: number;
};

const ICONS: Record<Kind, any> = {
  date: CalendarDays,
  participants: Users,
  organizer: Building2,
  location: MapPin,
  prize: Award,
};

const LABELS: Record<Kind, string> = {
  date: "Date",
  participants: "Participants",
  organizer: "Organizer",
  location: "Location",
  prize: "Prize",
};

export default function MetaItem({
  scheme,
  kind,
  value,
  tint,
  iconStroke = 2,
}: Props) {
  const C = Colors[scheme];
  const s = styles(C);
  const Icon = ICONS[kind];
  const color = tint ?? C.primary;

  // DEBUG: in ra console để chắc chắn MetaItem nhận đúng
  // (xóa sau khi xong)
  console.debug("[MetaItem]", kind, value);

  // “0” vẫn phải hiển thị → chỉ coi null/undefined là rỗng
  const text =
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
      ? "—"
      : String(value);

  return (
    <View style={[s.item, { borderColor: C.border, backgroundColor: C.card }]}>
      <View style={[s.iconWrap, { borderColor: C.border }]}>
        <Icon size={18} color={color} strokeWidth={iconStroke} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.label, { color }]}>{LABELS[kind]}</Text>
        <Text
          style={s.value} // <-- đã đổi màu cho dễ thấy
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = (C: any) =>
  StyleSheet.create({
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
    },
    iconWrap: {
      width: 30,
      height: 30,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    label: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    value: {
      // ƯU TIÊN text trên nền card; fallback sang foreground nếu theme không có
      color: (C.cardForeground ?? C.foreground) || "#111",
      fontSize: 15,
      fontWeight: "700",
      marginTop: 2,
    },
  });
