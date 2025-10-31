// components/ContestCard.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
import type { Contest } from "../../types";

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

const RADIUS = 8;
const COVER_H = 184;

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
  showStatusBar = true,
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

  const covers = useMemo(
    () => [
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1461344577544-4e5dc9487184?q=80&w=1600&auto=format&fit=crop",
    ],
    []
  );
  const cover =
    contest.bannerUrl ||
    covers[Number(String(contest.contestId ?? 0)) % covers.length];

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
        source={{ uri: cover }}
        style={s.cover}
        imageStyle={s.coverImg}
      >
        {showStatusBar && (
          <View style={[s.statusBar, { backgroundColor: statusColor }]} />
        )}
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
            <FileText size={16} color={C.mutedForeground} />
            <Text style={s.desc} numberOfLines={2}>
              {contest.description}
            </Text>
          </View>
        )}

        {/* Ngày & giải thưởng: GIỮ TRUNG TÍNH */}
        <Row icon={<CalendarDays size={16} color={C.mutedForeground} />}>
          <Text style={s.metaText}>{dateText}</Text>
        </Row>

        <Row icon={<Trophy size={16} color={C.mutedForeground} />}>
          <Text style={s.metaText}>
            {(contest.numOfAward ?? 0) + " giải thưởng"}
          </Text>
        </Row>

        {/* Trạng thái: CHỈ PHẦN NÀY ĐỔI MÀU */}
        <Row icon={<StatusIcon size={16} color={statusColor} />}>
          <Text style={[s.metaText, { color: statusColor, fontWeight: "800" }]}>
            {statusLabel}
          </Text>
        </Row>

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
        marginTop: 6,
      }}
    >
      <View style={{ width: 18, alignItems: "center" }}>{icon}</View>
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
      margin: 10,
      backgroundColor: "rgba(0,0,0,0.55)",
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 6,
      maxWidth: "92%",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.24)",
    },
    title: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "800",
      lineHeight: 20,
      letterSpacing: 0.2,
    },

    body: { padding: 14, gap: 6, backgroundColor: C.card },
    descRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
    desc: { color: C.mutedForeground, lineHeight: 18, fontSize: 13, flex: 1 },

    metaText: { color: C.foreground, fontSize: 13.5, fontWeight: "600" },

    ctaWrap: { marginTop: 10 },
    ctaBtn: {
      alignSelf: "flex-start",
      backgroundColor: BRAND.base,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },
    ctaText: { color: "#fff", fontSize: 12.5, fontWeight: "500" },
  });
