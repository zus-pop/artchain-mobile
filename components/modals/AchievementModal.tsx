// components/modals/AchievementModal.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { AchievementItem } from "@/types/achievements";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ArtworkPlaceholder from "../ArtworkPlaceholder";

/* ================= Helpers ================= */
const ACCENT = "hsl(15 85% 55%)";

/** Chỉ lấy ngày từ chuỗi ISO → "DD/MM/YYYY", không tạo new Date để tránh lệch TZ */
const fmtDateOnlyISO = (v?: string | null) => {
  if (!v) return "—";
  const iso = String(v);
  const ymd = iso.split("T")[0]; // "YYYY-MM-DD"
  const [y, m, d] = ymd.split("-");
  if (!y || !m || !d) return "—";
  return `${d}/${m}/${y}`;
};

const fmtPrize = (p: number | string) => {
  const n = typeof p === "string" ? parseFloat(p) : p;
  return Number.isFinite(n) ? n.toLocaleString("vi-VN") + "₫" : String(p);
};

type Props = {
  visible: boolean;
  onClose: () => void;
  item?: AchievementItem | null;
  maxHeightPct?: number; // dùng để tính snapPoint %
  disableBackdropClose?: boolean; // (không dùng nhiều, nhưng vẫn giữ prop cho tương thích)
  showClose?: boolean;
};

export default function AchievementModal({
  visible,
  onClose,
  item,
  maxHeightPct = 0.92,
  disableBackdropClose,
  showClose = true,
}: Props) {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(
    () => [`${Math.round(maxHeightPct * 100)}%`],
    [maxHeightPct]
  );

  // mở / đóng sheet theo visible
  useEffect(() => {
    if (!item) {
      bottomSheetModalRef.current?.dismiss();
      return;
    }
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible, item]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      // index === -1 => sheet đã đóng (swipe xuống / backdrop)
      if (index === -1) {
        onClose?.();
      }
    },
    [onClose]
  );

  if (!item) return null;

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backgroundStyle={{ backgroundColor: C.card }}
      handleIndicatorStyle={{ backgroundColor: C.mutedForeground }}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior={disableBackdropClose ? "none" : "close"}
        />
      )}
    >
      <BottomSheetScrollView style={{ flex: 1 }}>
        {/* Header giống bản cũ */}
        <View style={styles.topChrome}>
          <View style={[styles.header, { borderBottomColor: C.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIcon, { backgroundColor: ACCENT }]}>
                <Ionicons name="trophy" size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.title, { color: C.foreground }]}
                  numberOfLines={1}
                >
                  {item.award?.name ?? "Giải thưởng"}
                </Text>
                <Text
                  style={[styles.subtitle, { color: C.mutedForeground }]}
                  numberOfLines={1}
                >
                  {item.contest?.title ?? "—"}
                </Text>
              </View>
            </View>

            {showClose && (
              <TouchableOpacity
                onPress={onClose}
                style={styles.iconBtn}
                hitSlop={10}
              >
                <Ionicons name="close" size={22} color={ACCENT} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Nội dung scroll được */}
        <BottomSheetScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces
        >
          {/* Ảnh / Placeholder */}
          {item.paintingImage ? (
            <View style={[styles.imageWrap, { borderColor: C.border }]}>
              <Image
                source={{ uri: item.paintingImage }}
                style={styles.image}
                resizeMode="cover"
              />
              {!!item.award?.rank && (
                <View style={[styles.badge, { backgroundColor: ACCENT }]}>
                  <Ionicons name="ribbon" size={14} color="#fff" />
                  <Text style={styles.badgeTxt}>Top {item.award.rank}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.imageWrap, { borderColor: C.border }]}>
              <ArtworkPlaceholder
                solidBorder
                height={180}
                rounded={12}
                message="Tranh sẽ được chúng tôi cập nhật sớm nhất có thể"
                style={{ height: "100%", width: "100%" }}
              />
              {!!item.award?.rank && (
                <View style={[styles.badge, { backgroundColor: ACCENT }]}>
                  <Ionicons name="ribbon" size={14} color="#fff" />
                  <Text style={styles.badgeTxt}>Top {item.award.rank}</Text>
                </View>
              )}
            </View>
          )}

          {/* Thông tin chi tiết */}
          <View style={{ gap: 12 }}>
            {!!item.paintingTitle && (
              <>
                <Text
                  style={{
                    fontSize: 19,
                    color: C.foreground,
                    fontFamily: "Be Vietnam Pro",
                    fontWeight: "700",
                    textAlign: "center",
                  }}
                >
                  {item.paintingTitle}
                </Text>
                <View style={{ height: 1, backgroundColor: C.border }} />
              </>
            )}

            <Row
              C={C}
              icon="flag-outline"
              label="Cuộc thi"
              value={item.contest?.title || "—"}
              accent={ACCENT}
            />
            <Row
              C={C}
              icon="time-outline"
              label="Thời gian"
              value={
                item.contest?.startDate && item.contest?.endDate
                  ? `${fmtDateOnlyISO(
                      item.contest.startDate
                    )} → ${fmtDateOnlyISO(item.contest.endDate)}`
                  : "—"
              }
              accent={ACCENT}
            />
            <View style={{ height: 1, backgroundColor: C.border }} />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <Row
                C={C}
                icon="ribbon-outline"
                label="Xếp hạng"
                value={item.award?.rank ? `Hạng ${item.award.rank}` : "—"}
                accent={ACCENT}
              />
              <Row
                C={C}
                icon="cash-outline"
                label="Giải thưởng"
                value={
                  item.award?.prize != null
                    ? fmtPrize(item.award.prize as any)
                    : "—"
                }
                accent={ACCENT}
              />
            </View>

            {/* Ngày đạt */}
            <Row
              C={C}
              icon="calendar-outline"
              label="Ngày đạt"
              value={fmtDateOnlyISO(item.achievedDate)}
              accent={ACCENT}
            />

            {/* Mô tả giải */}
            {!!item.award?.description && (
              <Row
                C={C}
                icon="document-text-outline"
                label="Mô tả giải"
                value={item.award.description}
                multiline
                accent={ACCENT}
              />
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.primaryBtn, { backgroundColor: ACCENT }]}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryBtnTxt}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

function Row({
  C,
  icon,
  label,
  value,
  multiline,
  accent,
}: {
  C: any;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  multiline?: boolean;
  accent: string;
}) {
  return (
    <View style={{ gap: 6, flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons
          name={icon}
          size={16}
          color={accent}
          style={{ marginRight: 6 }}
        />
        <Text
          style={{
            fontSize: 15,
            color: C.primary,
            fontFamily: "Be Vietnam Pro",
          }}
        >
          {label}
        </Text>
      </View>
      {!!value && (
        <Text
          style={{
            color: "gray",
            fontWeight: "600",
            lineHeight: 20,
            fontFamily: "Be Vietnam Pro",
          }}
          numberOfLines={multiline ? 0 : 3}
        >
          {value}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topChrome: { paddingTop: 2 },
  dragZone: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 8,
  },
  handle: { width: 60, height: 6, borderRadius: 999, opacity: 0.9 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "800" },
  subtitle: { fontSize: 12 },
  iconBtn: { padding: 6, marginLeft: 4 },

  imageWrap: {
    height: 220,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
    borderWidth: StyleSheet.hairlineWidth,
  },
  image: { width: "100%", height: "100%" },
  badge: {
    position: "absolute",
    right: 10,
    bottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeTxt: { color: "#fff", fontWeight: "800", fontSize: 12 },

  footer: { flexDirection: "row", marginTop: 16, justifyContent: "center" },
  primaryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 4,
    width: "90%",
  },
  primaryBtnTxt: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
  },
});
