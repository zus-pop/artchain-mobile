// components/cards/SectionPanel.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  children: React.ReactNode;
  onSeeAll?: () => void;
};

export default function SectionPanel({ title, children, onSeeAll }: Props) {
  const scheme = useColorScheme() ?? "light";
  const s = React.useMemo(() => styles(scheme), [scheme]);

  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <Text style={s.title}>{title}</Text>
        {!!onSeeAll && (
          <Pressable onPress={onSeeAll}>
            <Text style={s.seeAll}>Xem tất cả</Text>
          </Pressable>
        )}
      </View>
      <View style={s.hr} />
      {children}
    </View>
  );
}

const styles = (scheme: "light" | "dark") =>
  StyleSheet.create({
    wrap: {
      marginHorizontal: 12,
      marginVertical: 8,
      backgroundColor: Colors[scheme].card,
      borderRadius: 16,
  
      borderColor: Colors[scheme].border,
      overflow: "hidden",
      // bóng rất nhẹ
      shadowColor: Colors[scheme].border,
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: "800",
      color: Colors[scheme].primary,
    },
    seeAll: {
      color: Colors[scheme].accentForeground,
      fontWeight: "700",
    },
    hr: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: Colors[scheme].border,
    },
  });
