import { Colors } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  scheme: "light" | "dark";
  title?: string;
  subtitle?: string;
  children?: React.ReactNode; // để nhét SearchBar + FilterButton
};

export default React.memo(function ContestsHeader({
  scheme,
  title = "Cuộc thi",
  subtitle = "Khám phá các cuộc thi vẽ hấp dẫn",
  children,
}: Props) {
  const C = Colors[scheme];
  const s = styles(C);
  return (
    <View style={s.header}>
      <View style={s.headerContent}>
        <Text style={s.headerTitle}>{title}</Text>
        <Text style={s.headerSubtitle}>{subtitle}</Text>
      </View>
      {children}
    </View>
  );
});

const styles = (C: typeof Colors.light) =>
  StyleSheet.create({
    header: {
      backgroundColor: C.card,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 20,
      borderBottomStartRadius: 12,
      borderBottomEndRadius: 12,
      borderBottomColor: C.border,
      borderBottomWidth: 0.8,
    },
    headerContent: { marginBottom: 16 },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: C.cardForeground,
      marginBottom: 4,
    },
    headerSubtitle: { fontSize: 16, color: C.mutedForeground },
  });
