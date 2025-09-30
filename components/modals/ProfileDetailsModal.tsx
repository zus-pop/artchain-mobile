import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type Scheme = "light" | "dark";

type Props = {
  visible: boolean;
  onClose: () => void;
  scheme: Scheme;
  user: {
    name: string;
    handle: string;
    email: string;
    phone: string;
    location: string;
    avatar: string;
    followers: number;
  };
  achievements?: { id: string; title: string; place: string }[];
};

const { height: SCREEN_H } = Dimensions.get("window");
const SNAP = { OPEN: 0, DISMISS: SCREEN_H };
const DRAG_CLOSE_THRESHOLD = 120;
const VELOCITY_CLOSE_THRESHOLD = 1.0;

const ProfileDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  scheme,
  user,
  achievements = [],
}) => {
  const C = Colors[scheme];
  const s = styles(C);

  // positions
  const translateY = useRef(new Animated.Value(SNAP.DISMISS)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const dragOffset = useRef(0);
  const scrollYRef = useRef(0);

  const openSheet = () => {
    translateY.setValue(SNAP.DISMISS);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: SNAP.OPEN,
        useNativeDriver: true,
        stiffness: 180,
        damping: 22,
        mass: 0.8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dragOffset.current = SNAP.OPEN;
    });
  };

  // Close: sheet xuống nhanh, backdrop fade 2s rồi onClose
  const closeSheet = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: SNAP.DISMISS,
        useNativeDriver: true,
        stiffness: 180,
        damping: 22,
        mass: 0.85,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dragOffset.current = SNAP.DISMISS;
      onClose();
    });
  };

  const animateTo = (to: number) => {
    if (to === SNAP.DISMISS) return closeSheet();
    Animated.spring(translateY, {
      toValue: to,
      useNativeDriver: true,
      stiffness: 180,
      damping: 22,
      mass: 0.8,
    }).start(() => (dragOffset.current = to));
  };

  useEffect(() => {
    if (visible) requestAnimationFrame(openSheet);
  }, [visible]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => {
          const isVertical = Math.abs(g.dy) > Math.abs(g.dx);
          const pullingDown = g.dy > 5;
          const canGrab =
            scrollYRef.current <= 0 || dragOffset.current > SNAP.OPEN;
          return isVertical && pullingDown && canGrab;
        },
        onPanResponderGrant: () => translateY.stopAnimation(),
        onPanResponderMove: (_, g) => {
          const next = Math.max(SNAP.OPEN, dragOffset.current + g.dy);
          translateY.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          const endY = dragOffset.current + g.dy;
          const shouldClose =
            g.vy > VELOCITY_CLOSE_THRESHOLD || endY > DRAG_CLOSE_THRESHOLD;
          animateTo(shouldClose ? SNAP.DISMISS : SNAP.OPEN);
        },
      }),
    []
  );

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = e.nativeEvent.contentOffset.y;
  };

  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      <View style={s.wrap}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={closeSheet}>
          <Animated.View style={[s.backdrop, { opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>

        {/* Bottom sheet */}
        <Animated.View
          style={[s.sheet, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          {/* Grabber + Header */}
          <View>
            <View style={s.grabberWrap}>
              <View style={s.grabber} />
            </View>

            <View style={s.headerRow}>
              <Text style={s.title}>Trang cá nhân</Text>
              <TouchableOpacity
                onPress={closeSheet}
                style={s.iconBtn}
                activeOpacity={0.85}
              >
                <Ionicons name="close" size={22} color={C.foreground} />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={s.divider} />
          </View>

          {/* Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
            bounces
            scrollEventThrottle={16}
            onScroll={onScroll}
          >
            {/* INFO — nổi bật hơn, khoảng cách gọn */}
            <View style={s.infoRow}>
              <View style={s.avatarRing}>
                <Image source={{ uri: user.avatar }} style={s.avatar} />
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.name} numberOfLines={1}>
                  {user.name}
                </Text>
                <Text style={s.handle} numberOfLines={1}>
                  @{user.handle}
                </Text>

                <View style={s.followChip}>
                  <Ionicons name="people" size={12} color={C.primary} />
                  <Text style={s.followTxt}>{user.followers} theo dõi</Text>
                </View>
              </View>
            </View>

            {/* Divider sát info */}
            <View style={[s.divider, { marginTop: 2 }]} />

            {/* CONTACTS — mỗi dòng có divider */}
            <View style={s.sectionTight}>
              <DetailRow
                icon="mail-outline"
                label={user.email}
                C={C}
                tone="blue"
              />
              <DetailRow
                icon="call-outline"
                label={user.phone}
                C={C}
                tone="green"
              />
              <DetailRow
                icon="location-outline"
                label={user.location}
                C={C}
                tone="purple"
                last
              />
            </View>

            {achievements.length > 0 && <View style={s.divider} />}

            {/* ACHIEVEMENTS — khoảng cách gọn, icon badge */}
            {achievements.length > 0 && (
              <View style={s.sectionTight}>
                <Text style={s.sectionTitle}>Thành tích</Text>
                {achievements.map((a, i) => (
                  <DetailRow
                    key={a.id}
                    icon="trophy-outline"
                    label={`${a.title} • ${a.place}`}
                    C={C}
                    tone="amber"
                    last={i === achievements.length - 1}
                  />
                ))}
              </View>
            )}

            <View style={s.divider} />

            {/* ACTIONS — sát nhau hơn */}
            <View style={s.actionsRow}>
              <TouchableOpacity
                style={[s.primaryBtn, { flex: 1 }]}
                onPress={closeSheet}
                activeOpacity={0.9}
              >
                <Text style={s.primaryTxt}>Xong</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.ghostBtn, { flex: 1 }]}
                activeOpacity={0.9}
              >
                <Text style={s.ghostTxt}>Chia sẻ</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

/** Dòng detail có icon badge + divider riêng, spacing gọn */
function DetailRow({
  icon,
  label,
  last,
  C,
  tone = "blue",
}: {
  icon: any;
  label: string;
  last?: boolean;
  C: any;
  tone?: "blue" | "green" | "purple" | "amber";
}) {
  const palette = {
    blue: { bg: "rgba(59,130,246,0.12)", fg: "#3B82F6", shadow: "#3B82F6" },
    green: { bg: "rgba(34,197,94,0.12)", fg: "#22C55E", shadow: "#22C55E" },
    purple: { bg: "rgba(168,85,247,0.12)", fg: "#A855F7", shadow: "#A855F7" },
    amber: { bg: "rgba(245,158,11,0.12)", fg: "#F59E0B", shadow: "#F59E0B" },
  }[tone];

  return (
    <View style={{ paddingVertical: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: palette.bg,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: palette.shadow,
            shadowOpacity: 0.16,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <Ionicons name={icon} size={16} color={palette.fg} />
        </View>
        <Text
          style={{ marginLeft: 10, color: C.foreground, flex: 1 }}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>

      {/* Divider riêng — mảnh và sát hơn */}
      <View
        style={[
          {
            height: StyleSheet.hairlineWidth,
            backgroundColor: C.border,
            opacity: 0.9,
            marginTop: 10,
            marginHorizontal: -14, // full-bleed tinh tế hơn
          },
          last ? { height: 0 } : null,
        ]}
      />
    </View>
  );
}

const styles = (C: any) =>
  StyleSheet.create({
    wrap: { flex: 1, justifyContent: "flex-end" },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.45)",
    },

    // bỏ viền bao; dùng shadow cho sang hơn
    sheet: {
      maxHeight: SCREEN_H * 0.9,
      backgroundColor: C.background,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      paddingHorizontal: 14, // gọn hơn
      paddingTop: 6,
      paddingBottom: 10,
      shadowColor: "#000",
      shadowOpacity: 0.14,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: -4 },
      elevation: 16,
    },

    grabberWrap: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 6,
    },
    grabber: {
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: C.border,
      opacity: 0.95,
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 2,
      paddingVertical: 8, // gọn
    },
    title: { fontSize: 18, fontWeight: "800", color: C.foreground },
    iconBtn: { padding: 6, marginRight: -6 },

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: C.border,
      opacity: 0.9,
      marginHorizontal: -14,
    },

    // INFO block — nổi bật
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10, // gọn
    },
    avatarRing: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: C.card,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
      borderWidth: 2,
      borderColor: C.primary, // viền primary làm nổi
    },
    avatar: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: C.muted,
    },

    name: { fontSize: 18, fontWeight: "900", color: C.foreground },
    handle: { color: C.mutedForeground, marginTop: 2, fontSize: 12 },

    followChip: {
      marginTop: 6,
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: C.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
    },
    followTxt: { color: C.primary, fontWeight: "700", fontSize: 12 },

    sectionTight: { paddingVertical: 6 }, // section gọn

    sectionTitle: { fontWeight: "800", color: C.foreground, marginBottom: 4 },

    actionsRow: { flexDirection: "row", gap: 10, marginTop: 8 },
    primaryBtn: {
      backgroundColor: C.primary,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    primaryTxt: { color: C.primaryForeground, fontWeight: "800" },
    ghostBtn: {
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      backgroundColor: C.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
    },
    ghostTxt: { color: C.foreground, fontWeight: "800" },
  });

export default ProfileDetailsModal;
