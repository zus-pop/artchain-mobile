// components/contest/ContestList.tsx
import { ContestCard } from "@/components/ContestCard";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type Contest = {
  contestId?: string | number;
  id?: string | number;
  // ... các field khác mà ContestCard cần (title, cover, status, ...)
};

type Props = {
  contests: Contest[];
  isLoading?: boolean;
  isFetching?: boolean;
  onItemPress?: (contest: Contest) => void;
  contentPaddingBottom?: number;
};

export default function ContestList({
  contests,
  isLoading,
  isFetching,
  onItemPress,
  contentPaddingBottom = 24,
}: Props) {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const s = styles(C);

  if (isLoading) {
    return (
      <View style={s.stateWrap}>
        <ActivityIndicator color={C.primary} />
        <Text style={s.stateText}>Đang tải cuộc thi...</Text>
      </View>
    );
  }

  if (!contests || contests.length === 0) {
    return (
      <View style={s.stateWrap}>
        <Text style={s.emptyText}>Không có cuộc thi phù hợp.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={contests}
        keyExtractor={(item) => String(item.contestId ?? item.id)}
        contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ContestCard
            contest={item as any}
            onPress={() => onItemPress?.(item)}
          />
        )}
        ListFooterComponent={
          isFetching ? (
            <View style={{ paddingVertical: 12, alignItems: "center" }}>
              <ActivityIndicator color={C.mutedForeground} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = (C: any) =>
  StyleSheet.create({
    stateWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: C.background,
      padding: 16,
    },
    stateText: { marginTop: 10, color: C.mutedForeground, fontSize: 16 },
    emptyText: { color: C.mutedForeground, fontSize: 16 },
  });
