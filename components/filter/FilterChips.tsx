import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/theme";

type Props = {
  scheme: "light" | "dark";
  visible: boolean;
  options: string[];
  selected: string;
  onSelect: (opt: string) => void;
};

export default React.memo(function FilterChips({
  scheme,
  visible,
  options,
  selected,
  onSelect,
}: Props) {
  if (!visible) return null;
  const C = Colors[scheme];
  const s = styles(C);

  return (
    <View style={s.filterOptions}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map((option) => {
          const active = selected === option;
          return (
            <TouchableOpacity
              key={option}
              style={[s.filterOption, active && s.filterOptionActive]}
              onPress={() => onSelect(option)}
            >
              <Text style={[s.filterOptionText, active && s.filterOptionTextActive]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = (C: typeof Colors.light) =>
  StyleSheet.create({
    filterOptions: { paddingTop: 20 },
    filterOption: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: C.input,
      borderRadius: 20,
      marginRight: 8,
    },
    filterOptionActive: { backgroundColor: C.primary },
    filterOptionText: { fontSize: 14, color: C.mutedForeground, fontWeight: "500" },
    filterOptionTextActive: { color: C.primaryForeground },
  });
