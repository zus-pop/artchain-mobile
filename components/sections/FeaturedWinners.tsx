
import PodiumWithCrownedUsers from "@/assets/PodiumWithCrownedUsers";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type Winner = { name: string; avatar?: string; initials?: string };

export interface FeaturedWinnersProps {
  title?: string;
  winners?: {
    top1: Winner;
    top2: Winner;
    top3: Winner;
  };
  height?: number; // chiều cao tổng thể vùng podium
  userSize?: number; // kích thước từng avatar icon
  onPressSeeAll?: () => void; // callback "Bảng xếp hạng"
}

const DEFAULT_WINNERS: FeaturedWinnersProps["winners"] = {
  top1: {
    name: "Nguyễn Minh Quân",
    avatar: "https://i.pravatar.cc/256?img=11",
    initials: "MQ",
  },
  top2: {
    name: "Trần Hoài An",
    avatar: "https://i.pravatar.cc/256?img=22",
    initials: "HA",
  },
  top3: {
    name: "Lê Bảo Châu",
    avatar: "https://i.pravatar.cc/256?img=33",
    initials: "BC",
  },
};

const FeaturedWinners: React.FC<FeaturedWinnersProps> = ({
  title = "Kết quả nổi bật",
  winners = DEFAULT_WINNERS,
  height = 360,
  userSize = 120,
  onPressSeeAll,
}) => {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";

  return (
    <View style={{ paddingHorizontal: 20, marginTop: 8, marginBottom: 8 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: Colors[scheme].foreground,
          }}
        >
          {title}
        </Text>

        <TouchableOpacity
          onPress={onPressSeeAll}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: Colors[scheme].muted,
          }}
        >
          <Text
            style={{
              color: Colors[scheme].accentForeground,
              fontWeight: "600",
            }}
          >
            Bảng xếp hạng
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors[scheme].accentForeground}
          />
        </TouchableOpacity>
      </View>

      {/* Card wrapper */}
      <View
        style={{
          backgroundColor: Colors[scheme].card,
          borderRadius: 16,
          paddingVertical: 12,
          paddingHorizontal: 8,
          shadowColor: Colors[scheme].mutedForeground,
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 1,
        }}
      >
        <PodiumWithCrownedUsers
          width="100%"
          height={height}
          userSize={userSize}
          avatarUrl1={winners.top1.avatar}
          avatarUrl2={winners.top2.avatar}
          avatarUrl3={winners.top3.avatar}
          initials1={winners.top1.initials}
          initials2={winners.top2.initials}
          initials3={winners.top3.initials}
          variant="color"
          withGradient
          showLaurel
          showRibbon
          glow
          showRing
          strokeWidth={0}
          colors={{
            gold: "#F4C84A",
            silver: "#C9CED6",
            bronze: "#C58A5B",
            shadow: Colors[scheme].muted,
            text: Colors[scheme].foreground,
          }}
          crownProps1={{ ariaLabel: `Quán quân: ${winners.top1.name}` }}
          crownProps2={{ ariaLabel: `Á quân: ${winners.top2.name}` }}
          crownProps3={{ ariaLabel: `Hạng 3: ${winners.top3.name}` }}
        />

        {/* Caption tên 3 top */}
        <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
          <Text
            style={{
              textAlign: "center",
              color: Colors[scheme].mutedForeground,
              fontSize: 12,
            }}
          >
            Top 1: {winners.top1.name} • Top 2: {winners.top2.name} • Top 3:{" "}
            {winners.top3.name}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default FeaturedWinners;
