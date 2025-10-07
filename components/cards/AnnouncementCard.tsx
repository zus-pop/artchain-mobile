import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
interface Announcement {
  id: string;
  title: string;
  summary: string;
  image: string;
  date: string;
  type: "contest" | "result";
}
type Props = {
  item: Announcement;
  onPress?: (item: Announcement) => void;
  showDivider?: boolean;
  thumbSize?: number; // <-- new
  radius?: number; // <-- new
};

export default function AnnouncementCard({
  item,
  onPress,
  showDivider = true,
  thumbSize = 84, // mặc định lớn hơn 64
  radius = 12,
}: Props) {
  const scheme = useColorScheme() ?? "light";
  const s = React.useMemo(
    () => styles(scheme, thumbSize, radius),
    [scheme, thumbSize, radius]
  );

  return (
    <View style={s.wrap}>
      <Pressable
        onPress={() => onPress?.(item)}
        android_ripple={{ color: Colors[scheme].muted }}
        style={s.row}
      >
        <View style={s.thumbWrap}>
          <Image
            source={{ uri: item.image }}
            style={s.thumb}
            resizeMode="cover"
          />
        </View>

        <View style={s.content}>
          <Text numberOfLines={1} style={s.title}>
            {item.title}
          </Text>
          <Text numberOfLines={2} style={s.summary}>
            {item.summary}
          </Text>
          <View style={s.meta}>
            <Text style={s.date}>
              {new Date(item.date).toLocaleDateString("vi-VN")}
            </Text>
            <Text style={s.badge}>
              {item.type === "contest" ? "Cuộc thi" : "Kết quả"}
            </Text>
          </View>
        </View>
      </Pressable>

      <View style={s.divider} />
    </View>
  );
}

// styles: dùng thumbSize & radius
const styles = (scheme: "light" | "dark", THUMB = 64, R = 10) =>
  StyleSheet.create({
    wrap: { backgroundColor: Colors[scheme].card },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 15,
    },
    thumbWrap: {
      width: THUMB,
      height: THUMB + 20,
      overflow: "hidden",
      marginRight: 12,
      borderRadius: R,
      backgroundColor: Colors[scheme].muted,
    },
    thumb: { width: "100%", height: "100%" }, // KHÔNG cần 120%
    content: { flex: 1 },
    title: {
      fontSize: 16,
      fontWeight: "800",
      color: Colors[scheme].foreground,
      marginBottom: 4,
    },
    summary: {
      fontSize: 13,
      color: Colors[scheme].mutedForeground,
      marginBottom: 6,
    },
    meta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    date: {
      fontSize: 12,
      color: Colors[scheme].mutedForeground,
      fontStyle: "italic",
    },
    badge: {
      fontSize: 12,
      fontWeight: "700",
      color: Colors[scheme].accentForeground,
    },
    divider: {
      height: 1,
      width: "100%",
      backgroundColor: Colors[scheme].muted, // dùng màu nhạt từ theme
      //   marginLeft: 14 + THUMB + 12,
      marginHorizontal: 20,
    },
  });
