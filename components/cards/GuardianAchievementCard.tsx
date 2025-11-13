// components/cards/guardian/GuardianAchievementCard.tsx
import ArtworkPlaceholder from "@/components/ArtworkPlaceholder";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { AchievementItem, AchievementUser } from "@/types/achievements";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/* ========== Helpers ========== */

const fmtDateOnlyISO = (v?: string | null) => {
  if (!v) return "—";
  const iso = String(v);
  const ymd = iso.split("T")[0]; 
  const [y, m, d] = ymd.split("-");
  if (!y || !m || !d) return "—";
  return `${d}/${m}/${y}`;
};

const fmtPrize = (p: number | string) => {
  const n = typeof p === "string" ? parseFloat(p) : p;
  return Number.isFinite(n) ? n.toLocaleString("vi-VN") + "₫" : String(p);
};

const VIVID_POOLS: [string, string][] = [
  ["#FF6B6B", "#FFD166"],
  ["#06B6D4", "#3B82F6"],
  ["#22C55E", "#A3E635"],
  ["#F472B6", "#A78BFA"],
  ["#F59E0B", "#F97316"],
  ["#14B8A6", "#84CC16"],
  ["#60A5FA", "#F472B6"],
  ["#F43F5E", "#FB7185"],
];

const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/* ========== Props ========== */

type Props = {
  item: AchievementItem;
  child: AchievementUser; // bé nào
  onPress?: () => void;
};

const GuardianAchievementCard: React.FC<Props> = ({ item, child, onPress }) => {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];

  const seed = `${child.userId}-${item.paintingId}`;
  const [g1, g2] = VIVID_POOLS[hashStr(seed) % VIVID_POOLS.length];

  const initial =
    child.fullName?.trim()?.charAt(0)?.toUpperCase() ?? child.fullName ?? "?";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[st.card, { borderColor: C.border, backgroundColor: C.card }]}
    >
      {/* Gradient strip bên trái */}
      <LinearGradient
        colors={[g1, g2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={st.gradientStrip}
      />

      {/* Thumbnail tranh */}
      <View style={st.thumbWrap}>
        {item.paintingImage ? (
          <Image
            source={{ uri: item.paintingImage }}
            style={st.thumb}
            resizeMode="cover"
          />
        ) : (
          <ArtworkPlaceholder
            solidBorder
            rounded={10}
            height={64}
            message=""
            style={st.thumb}
          />
        )}
        {/* Rank badge nếu có */}
        {!!item.award?.rank && (
          <View style={st.rankBadge}>
            <Ionicons name="ribbon" size={12} color="#fff" />
            <Text style={st.rankTxt}>Top {item.award.rank}</Text>
          </View>
        )}
      </View>

      {/* Nội dung bên phải */}
      <View style={st.content}>
        {/* Bé nào */}
        <View style={st.childRow}>
          <View style={st.childAvatar}>
            <Text style={st.childAvatarTxt}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[st.childName, { color: C.foreground }]}
              numberOfLines={1}
            >
              {child.fullName}
            </Text>
            <View style={st.childMetaRow}>
              <Ionicons
                name="person-circle-outline"
                size={13}
                color={C.mutedForeground}
              />
              <Text
                style={[st.childMetaTxt, { color: C.mutedForeground }]}
                numberOfLines={1}
              >
                Con em của bạn
              </Text>
            </View>
          </View>
        </View>

        {/* Tên tranh */}
        <Text
          style={[st.paintingTitle, { color: C.foreground }]}
          numberOfLines={2}
        >
          {item.paintingTitle}
        </Text>

        {/* Cuộc thi */}
        <View style={st.row}>
          <Ionicons name="trophy-outline" size={14} color={C.primary} />
          <Text
            style={[st.contestTitle, { color: C.mutedForeground }]}
            numberOfLines={1}
          >
            {item.contest?.title ?? "Cuộc thi nghệ thuật"}
          </Text>
        </View>

        {/* Chips hàng dưới: ngày đạt + hạng + giải thưởng */}
        <View style={st.chipRow}>
          <View style={[st.chip, { backgroundColor: C.muted }]}>
            <Ionicons name="calendar-outline" size={12} color={C.foreground} />
            <Text style={[st.chipTxt, { color: C.foreground }]}>
              {fmtDateOnlyISO(item.achievedDate)}
            </Text>
          </View>

          {item.award?.rank && (
            <View style={[st.chip, { backgroundColor: "#fee2e2" }]}>
              <Ionicons name="ribbon-outline" size={12} color="#b91c1c" />
              <Text style={[st.chipTxt, { color: "#b91c1c" }]}>
                Hạng {item.award.rank}
              </Text>
            </View>
          )}

          {item.award?.prize != null && (
            <View style={[st.chip, { backgroundColor: "#ecfdf3" }]}>
              <Ionicons name="cash-outline" size={12} color="#15803d" />
              <Text style={[st.chipTxt, { color: "#166534" }]}>
                {fmtPrize(item.award.prize)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default GuardianAchievementCard;

/* ========== Styles ========== */

const st = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 10,
  },
  gradientStrip: {
    width: 6,
  },
  thumbWrap: {
    width: 80,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  rankBadge: {
    position: "absolute",
    bottom: 6,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.85)",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  rankTxt: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 3,
  },

  content: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 12,
    paddingLeft: 4,
    gap: 4,
  },

  // Child info
  childRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  childAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(15,23,42,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  childAvatarTxt: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  childName: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Be Vietnam Pro",
  },
  childMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  childMetaTxt: {
    fontSize: 11,
    fontFamily: "Be Vietnam Pro",
  },

  paintingTitle: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Be Vietnam Pro",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  contestTitle: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Be Vietnam Pro",
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  chipTxt: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Be Vietnam Pro",
  },
});
