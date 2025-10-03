import { Colors } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Filter, Search, Trash2, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  scheme: "light" | "dark";
  /** Giá trị text control từ parent */
  value: string;
  /** Khi text thay đổi */
  onChangeText: (t: string) => void;
  /** Toggle panel filter */
  onToggleFilters: () => void;
  /** Gọi khi user submit (ấn Search trên bàn phím hoặc chạm chip) */
  onSubmitSearch?: (t: string) => void;
  /** Key lưu history riêng nếu muốn tái sử dụng component */
  storageKey?: string; // default "@search_history_contests"
};

const MAX_HISTORY = 5;

export default React.memo(function SearchBar({
  scheme,
  value,
  onChangeText,
  onToggleFilters,
  onSubmitSearch,
  storageKey = "@search_history_contests",
}: Props) {
  const C = Colors[scheme];
  const s = styles(C);

  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // tải history 1 lần
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) setHistory(arr.filter(Boolean));
        }
      } catch {
        /* noop */
      }
    })();
  }, [storageKey]);

  const hasHistory = history.length > 0;

  // Lưu từ khóa vào history (FIFO, bỏ trùng, tối đa 5)
  const saveToHistory = async (term: string) => {
    const t = term.trim();
    if (!t) return;
    try {
      const next = [
        t,
        ...history.filter((h) => h.toLowerCase() !== t.toLowerCase()),
      ].slice(0, MAX_HISTORY);
      setHistory(next);
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* noop */
    }
  };

  // Xoá tất cả
  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(storageKey);
      setHistory([]);
    } catch {
      /* noop */
    }
  };

  // Xoá 1 mục
  const removeOne = async (item: string) => {
    try {
      const next = history.filter((h) => h !== item);
      setHistory(next);
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* noop */
    }
  };

  const submit = async (t: string) => {
    const term = t.trim();
    if (!term) return;
    await saveToHistory(term);
    Keyboard.dismiss();
    onSubmitSearch?.(term);
  };

  const showHistoryChips = useMemo(
    () => focused && hasHistory && !value, // chỉ hiện khi focus và ô đang trống
    [focused, hasHistory, value]
  );

  return (
    <View>
      {/* Thanh tìm kiếm */}
      <View style={s.searchSection}>
        <View style={s.searchContainer}>
          <Search size={18} color={C.mutedForeground} style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="Tìm kiếm cuộc thi..."
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor={C.mutedForeground}
            returnKeyType="search"
            onSubmitEditing={() => submit(value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />

          {/* nút xóa nhanh trong ô (hiện khi có text) */}
          {value?.length > 0 && (
            <Pressable
              onPress={() => onChangeText("")}
              style={({ pressed }) => [
                s.clearBtn,
                { opacity: pressed ? 0.75 : 1, backgroundColor: C.input },
              ]}
              hitSlop={8}
            >
              <X size={14} color={C.mutedForeground} />
            </Pressable>
          )}
        </View>

        <TouchableOpacity
          style={s.filterButton}
          onPress={onToggleFilters}
          activeOpacity={0.85}
        >
          <Filter size={18} color={C.primaryForeground} />
        </TouchableOpacity>
      </View>

      {/* Lịch sử (chips) */}
      {showHistoryChips && (
        <View style={s.historyWrap}>
          <View style={s.historyHeader}>
            <Text style={s.historyTitle}>Tìm kiếm gần đây</Text>
            <Pressable
              onPress={clearHistory}
              style={({ pressed }) => [
                { opacity: pressed ? 0.8 : 1, padding: 4 },
              ]}
              hitSlop={8}
            >
              <View style={s.clearAllBtn}>
                <Trash2 size={14} color={C.primary} />
                <Text style={s.clearHistory}>Xóa hết</Text>
              </View>
            </Pressable>
          </View>

          <View style={s.chipsRow}>
            {history.map((h) => (
              <View key={h} style={[s.chip, { borderColor: C.border }]}>
                {/* Tap vào text => tìm nhanh */}
                <Pressable
                  onPress={() => submit(h)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  hitSlop={6}
                >
                  <Text style={s.chipText} numberOfLines={1}>
                    {h}
                  </Text>
                </Pressable>

                {/* nút xoá từng chip */}
                <Pressable
                  onPress={() => removeOne(h)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    s.chipRemove,
                    { backgroundColor: pressed ? C.input : "transparent" },
                  ]}
                >
                  <X size={12} color={C.mutedForeground} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
});

const styles = (C: typeof Colors.light) =>
  StyleSheet.create({
    searchSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    searchContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.input,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    searchIcon: { marginRight: 8, opacity: 0.85 },
    searchInput: {
      flex: 1,
      paddingVertical: 4,
      fontSize: 15,
      color: C.foreground,
    },
    clearBtn: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    filterButton: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: C.primary,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },

    // history
    historyWrap: { marginTop: 10 },
    historyHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
      paddingHorizontal: 2,
    },
    historyTitle: { fontWeight: "800", fontSize: 13, color: C.mutedForeground },
    clearAllBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
    clearHistory: { fontWeight: "700", fontSize: 12, color: C.primary },

    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 12,
      paddingRight: 6,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: C.card,
      gap: 6,
      maxWidth: 260,
    },
    chipText: {
      color: C.foreground,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 0.2,
      maxWidth: 220,
    },
    chipRemove: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
  });
