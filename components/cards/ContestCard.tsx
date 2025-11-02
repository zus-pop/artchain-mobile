// components/ContestCard.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Contest } from "@/types";
import {
  CalendarDays,
  CheckCircle2,
  CircleSlash,
  FileText,
  Pencil,
  PlayCircle,
  Trophy,
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  contest: Contest;
  onPress?: () => void;
  cardBorderWidth?: number;
  withShadow?: boolean;
  showStatusBar?: boolean;
};

const BRAND = {
  base: "#DC5A54",
  a12: "rgba(220,90,84,0.12)",
  a22: "rgba(220,90,84,0.22)",
} as const;

// chỉ định màu cho TRẠNG THÁI (không áp vào phần khác của card)
const STATUS_COLORS = {
  ACTIVE: "#DC5A54",
  UPCOMING: "#D97706",
  COMPLETED: "#16A34A",
  ENDED: "#64748B",
  DRAFT: "#94A3B8",
} as const;

const RADIUS = 12;
const COVER_H = 160;

function fmtVNStr(d?: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("vi-VN");
  } catch {
    return d ?? "";
  }
}

function getStatusMeta(statusRaw?: string) {
  const key = String(
    statusRaw ?? ""
  ).toUpperCase() as keyof typeof STATUS_COLORS;
  switch (key) {
    case "ACTIVE":
      return {
        label: "Đang diễn ra",
        Icon: PlayCircle as any,
        color: STATUS_COLORS.ACTIVE,
      };
    case "UPCOMING":
      return {
        label: "Sắp diễn ra",
        Icon: CalendarDays as any,
        color: STATUS_COLORS.UPCOMING,
      };
    case "COMPLETED":
      return {
        label: "Hoàn thành",
        Icon: CheckCircle2 as any,
        color: STATUS_COLORS.COMPLETED,
      };
    case "ENDED":
      return {
        label: "Đã kết thúc",
        Icon: CircleSlash as any,
        color: STATUS_COLORS.ENDED,
      };
    case "DRAFT":
      return { label: "Nháp", Icon: Pencil as any, color: STATUS_COLORS.DRAFT };
    default:
      return {
        label: statusRaw || "—",
        Icon: CircleSlash as any,
        color: STATUS_COLORS.ENDED,
      };
  }
}

export function ContestCard({
  contest,
  onPress,
  cardBorderWidth,
  withShadow = true,
}: Props) {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];

  const BORDER = {
    width: cardBorderWidth ?? 1,
    color: scheme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.12)",
    innerStroke:
      scheme === "light" ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)",
  };

  const s = useMemo(
    () => styles(C, BORDER, withShadow),
    [C, BORDER.width, withShadow]
  );

  const {
    label: statusLabel,
    Icon: StatusIcon,
    color: statusColor,
  } = getStatusMeta(contest.status);

  const startStr = fmtVNStr(contest.startDate);
  const endStr = fmtVNStr(contest.endDate);
  const dateText =
    startStr && endStr ? `${startStr} - ${endStr}` : endStr ? endStr : "—";

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: BRAND.a12 }}
      style={({ pressed }) => [
        s.card,
        pressed && { opacity: 0.97, transform: [{ scale: 0.997 }] },
      ]}
      accessibilityLabel={`Cuộc thi: ${
        contest.title ?? "Không tên"
      }. Trạng thái: ${statusLabel}.`}
    >
      {/* Cover */}
      <ImageBackground
        source={{ uri: contest.bannerUrl }}
        style={s.cover}
        imageStyle={s.coverImg}
      >
        <View style={s.overlay} />
        <View style={[s.innerStroke, { borderColor: BORDER.innerStroke }]} />
        <View style={s.titlePill}>
          <Text style={s.title} numberOfLines={2}>
            {contest.title || "Cuộc thi không tên"}
          </Text>
        </View>
      </ImageBackground>

      {/* Body */}
      <View style={s.body}>
        {!!contest.description && (
          <View style={s.descRow}>
            <FileText size={15} color={C.mutedForeground} />
            <Text style={s.desc} numberOfLines={2}>
              {contest.description}
            </Text>
          </View>
        )}

        <View style={s.metaSection}>
          {/* Ngày & giải thưởng: GIỮ TRUNG TÍNH */}
          <Row icon={<CalendarDays size={15} color={C.mutedForeground} />}>
            <Text style={s.metaText} numberOfLines={1}>
              {dateText}
            </Text>
          </Row>

          <Row icon={<Trophy size={15} color={C.mutedForeground} />}>
            <Text style={s.metaText} numberOfLines={1}>
              {(contest.numOfAward ?? 0) + " giải thưởng"}
            </Text>
          </Row>

          {/* Trạng thái: CHỈ PHẦN NÀY ĐỔI MÀU */}
          <Row icon={<StatusIcon size={15} color={statusColor} />}>
            <Text
              style={[s.metaText, { color: statusColor, fontWeight: "800" }]}
              numberOfLines={1}
            >
              {statusLabel}
            </Text>
          </Row>
        </View>

        {/* CTA theo brand */}
        <View style={s.ctaWrap}>
          <Pressable
            onPress={onPress}
            android_ripple={{ color: BRAND.a22 }}
            style={({ pressed }) => [s.ctaBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={s.ctaText}>Xem Chi Tiết</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function Row({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <View style={{ width: 16, alignItems: "center" }}>{icon}</View>
      {children}
    </View>
  );
}

/* ===== styles ===== */
const styles = (
  C: any,
  BORDER: { width: number; color: string; innerStroke: string },
  withShadow: boolean
) =>
  StyleSheet.create({
    card: {
      backgroundColor: C.card, // không đổi theo status
      borderRadius: RADIUS,
      overflow: "hidden",
      borderWidth: BORDER.width,
      borderColor: BORDER.color,
      ...(withShadow
        ? {
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 2,
          }
        : null),
    },
    cover: { width: "100%", height: COVER_H, justifyContent: "flex-end" },
    coverImg: { resizeMode: "cover" },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.10)",
    },
    innerStroke: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: RADIUS,
      borderWidth: StyleSheet.hairlineWidth,
    },
    statusBar: { position: "absolute", top: 0, left: 0, right: 0, height: 3 }, // màu set theo status

    titlePill: {
      alignSelf: "flex-start",
      margin: 12,
      backgroundColor: "rgba(0,0,0,0.65)",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      maxWidth: "90%",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.3)",
    },
    title: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "800",
      lineHeight: 19,
      letterSpacing: 0.2,
    },

    body: { padding: 16, gap: 4, backgroundColor: C.card },
    descRow: {
      flexDirection: "row",
      gap: 8,
      alignItems: "flex-start",
      marginBottom: 8,
    },
    desc: { color: C.mutedForeground, lineHeight: 17, fontSize: 13, flex: 1 },

    metaSection: { gap: 6, marginTop: 4 },
    metaText: { color: C.foreground, fontSize: 13, fontWeight: "600", flex: 1 },

    ctaWrap: { marginTop: 12 },
    ctaBtn: {
      width: "100%",
      backgroundColor: BRAND.base,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },
    ctaText: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
  });
