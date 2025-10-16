// PodiumTop123.tsx (TypeScript – ColorBurst Ultra // No-Pedestal + Pro Framed Details + TOP Medals)
// - Huy chương hiển thị "TOP 1/2/3" (không còn chỉ mỗi số)
// - Giữ avatar + khung info glassy; không dùng thư viện ngoài

import React, { ReactNode, useEffect, useMemo } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

const { width } = Dimensions.get("window");

export type Rank = 1 | 2 | 3;

export type Winner = {
  id?: string;
  name: string;
  avatarUri?: string;
  badgeText?: string; // e.g. "98 điểm"
};

export type Theme = {
  gold: string;
  silver: string;
  bronze: string;
  nameColor: string;
  badgeColor: string;
  badgeBg: string;
  avatarBg: string;
  ring: string;
  ring2: string;
  surface: string;
  chipBg: string;
  chipText: string;
  fireworkColors: string[];
  wreathLeaf: string; // emoji when mode === "emoji"
  haloColors?: string[];
  medalText?: string;
  cardBg?: string; // nền khung info
  cardBorderSoft?: string; // viền trong khung info
};

const DEFAULT_THEME: Theme = {
  gold: "#FFC83A",
  silver: "#CDD6E0",
  bronze: "#E09F6A",
  nameColor: "#0B132B",
  badgeColor: "#0B132B",
  badgeBg: "rgba(11,19,43,0.08)",
  avatarBg: "#0B1220",
  ring: "#FFFFFF",
  ring2: "#84FAB0",
  surface: "#FFFFFF",
  chipBg: "rgba(132,250,176,0.18)",
  chipText: "#0B132B",
  fireworkColors: [
    "#F72585",
    "#B5179E",
    "#7209B7",
    "#560BAD",
    "#4361EE",
    "#4CC9F0",
    "#06D6A0",
    "#FFD166",
    "#EF476F",
  ],
  wreathLeaf: "🍃",
  haloColors: ["#ff7b7b", "#ffd166", "#06d6a0", "#4cc9f0", "#a78bfa"],
  medalText: "#0B132B",
  cardBg: "rgba(255,255,255,0.70)",
  cardBorderSoft: "rgba(0,0,0,0.06)",
};

export type Sizes = {
  overallScale?: number;
  mainAvatar?: number;
  sideAvatar?: number;
};

export type AvatarOffsetY = {
  main?: number; // âm = hạ gần “mặt đất”
  side?: number;
};

export type Ring = {
  width?: number;
  innerWidth?: number;
};

export type PodiumTop123Props = {
  winners: [Winner, Winner, Winner];
  containerStyle?: ViewStyle;

  onPressRank?: (rank: Rank) => void;
  onPressWinner?: (args: { winner: Winner; rank: Rank }) => void;

  sizes?: Sizes;
  theme?: Theme;
  // luôn dùng medal tròn số (đúng yêu cầu "icon huy chương TOP 1 2 3")
  useEmojiMedals?: boolean; // vẫn hỗ trợ; mặc định false
  avatarOffsetY?: AvatarOffsetY;
  ring?: Ring;

  renderCrown?: (args: { rank: Rank }) => ReactNode;
  renderAvatar?: (args: {
    uri?: string;
    size: number;
    fallback: string;
    rank: Rank;
    theme: Theme;
  }) => ReactNode;

  fireworks?: {
    enabled?: boolean;
    loopMs?: number;
    particleCount?: number;
    durationMs?: number;
  };

  halo?: {
    forAll?: boolean;
    enabled?: boolean;
    pulseMs?: number;
    spread?: number;
  };

  sparkle?: {
    enabled?: boolean;
  };
};

const podWidth = Math.min(width - 24, 420);
const laneWidthBase = podWidth / 3.6;

/* =============== utils =============== */
function getInitials(name: string = ""): string {
  const v = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return v || "—";
}

function rankAccent(theme: Theme, rank: Rank): string {
  return rank === 1 ? theme.gold : rank === 2 ? theme.silver : theme.bronze;
}

/* =============== TOP Medal (circle with TOP + number) =============== */
function TopMedalBadge({
  rank,
  useEmoji,
  theme,
  size = 30,
}: {
  rank: Rank;
  useEmoji: boolean;
  theme: Theme;
  size?: number;
}) {
  if (useEmoji) {
    const emoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
    return (
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: size + 4, lineHeight: size + 6 }}>
          {emoji}
        </Text>
        <Text
          style={{
            marginTop: -2,
            fontSize: Math.max(10, size * 0.48),
            fontWeight: "900",
            color: theme.medalText || "#111",
            letterSpacing: 0.6,
          }}
        >
          TOP {rank}
        </Text>
      </View>
    );
  }

  const bg = rankAccent(theme, rank);
  const d = size + 14; // đường kính mặt huy chương
  return (
    <View style={{ alignItems: "center" }}>
      {/* đuôi ruy băng nhẹ */}
      <View
        style={{
          position: "absolute",
          top: d - 6,
          width: d * 0.58,
          height: d * 0.34,
          backgroundColor: `${bg}CC`,
          transform: [{ rotate: "-7deg" }],
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          zIndex: 0,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: d - 6,
          right: -6,
          width: d * 0.48,
          height: d * 0.32,
          backgroundColor: `${bg}A6`,
          transform: [{ rotate: "9deg" }],
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          zIndex: 0,
        }}
      />

      {/* mặt huy chương */}
      <View
        style={{
          width: d,
          height: d,
          borderRadius: d / 2,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 3 },
          elevation: 4,
        }}
      >
        {/* highlight trên */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: d * 0.42,
            backgroundColor: "rgba(255,255,255,0.45)",
            borderTopLeftRadius: d / 2,
            borderTopRightRadius: d / 2,
          }}
        />
        {/* viền trong */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            inset: 5,
            borderRadius: (d - 10) / 2,
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.55)",
          }}
        />
        {/* chữ TOP */}
        <Text
          style={{
            color: theme.medalText,
            fontWeight: "900",
            letterSpacing: 0.8,
            fontSize: Math.max(10, d * 0.2),
            marginBottom: -2,
          }}
        >
          TOP
        </Text>
        {/* số hạng */}
        <Text
          style={{
            color: theme.medalText,
            fontWeight: "900",
            fontSize: d * 0.46,
            lineHeight: d * 0.5,
          }}
        >
          {rank}
        </Text>
      </View>
    </View>
  );
}

/* =============== Framed Details (name + score inside a pro card) =============== */
function FramedDetails({
  rank,
  name,
  badge,
  theme,
  emphasize = false,
}: {
  rank: Rank;
  name: string;
  badge?: string;
  theme: Theme;
  emphasize?: boolean;
}) {
  const accent = rankAccent(theme, rank);
  return (
    <View
      style={{
        marginTop: 8,
        padding: 8,
        paddingTop: 10,
        minWidth: 120,
        alignItems: "center",
        borderRadius: 14,
        backgroundColor: theme.cardBg || "rgba(255,255,255,0.7)",
        borderWidth: 1,
        borderColor: theme.cardBorderSoft || "rgba(0,0,0,0.06)",
      }}
    >
      <View
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: `${accent}66`,
          opacity: 0.9,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 10,
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
          backgroundColor: "rgba(255,255,255,0.35)",
          opacity: 0.55,
        }}
        pointerEvents="none"
      />
      <Text
        numberOfLines={1}
        style={{
          fontSize: emphasize ? 16 : 15,
          fontWeight: "800",
          letterSpacing: 0.2,
          color: theme.nameColor,
        }}
      >
        {name || "—"}
      </Text>
      {!!badge && (
        <View
          style={{
            marginTop: 6,
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 10,
            backgroundColor: theme.badgeBg,
            borderWidth: 1,
            borderColor: `${accent}33`,
          }}
        >
          <Text
            numberOfLines={1}
            style={{ fontSize: 12, fontWeight: "700", color: theme.badgeColor }}
          >
            {badge}
          </Text>
        </View>
      )}
    </View>
  );
}

/* =============== Avatar (sparkle multi-ring) =============== */
function Avatar({
  uri,
  size,
  fallback,
  theme,
  ringWidth = 2.2,
  ring2Width = 1.2,
  sparkle = true,
}: {
  uri?: string;
  size: number;
  fallback: string;
  theme: Theme;
  ringWidth?: number;
  ring2Width?: number;
  sparkle?: boolean;
}) {
  const outer = size + ringWidth * 2 + ring2Width * 2;

  const dots = useMemo(() => {
    if (!sparkle) return [];
    return Array.from({ length: 10 }).map((_, i) => {
      const angle = (i / 10) * Math.PI * 2 + (i % 2 ? 0.18 : 0);
      const r = outer / 2 + 6;
      return {
        key: `d${i}`,
        left: outer / 2 + Math.cos(angle) * r - 2,
        top: outer / 2 + Math.sin(angle) * r - 2,
        size: i % 3 === 0 ? 3.5 : 3,
        opacity: i % 2 ? 0.9 : 0.65,
      };
    });
  }, [outer, sparkle]);

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: outer,
          height: outer,
          borderRadius: outer / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.surface,
        }}
      >
        {ring2Width > 0 && (
          <View
            style={{
              position: "absolute",
              width: size + ring2Width * 2 + ringWidth * 2,
              height: size + ring2Width * 2 + ringWidth * 2,
              borderRadius: (size + ring2Width * 2 + ringWidth * 2) / 2,
              borderWidth: ring2Width,
              borderColor: theme.ring2,
            }}
          />
        )}
        <View
          style={{
            width: size + ringWidth * 2,
            height: size + ringWidth * 2,
            borderRadius: (size + ringWidth * 2) / 2,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: ringWidth,
            borderColor: theme.ring,
            backgroundColor: theme.avatarBg,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
          {uri ? (
            <Image
              source={{ uri }}
              style={{ width: size, height: size, borderRadius: size / 2 }}
            />
          ) : (
            <Text
              style={{
                color: "white",
                fontWeight: "800",
                fontSize: size * 0.36,
              }}
            >
              {fallback}
            </Text>
          )}
        </View>
      </View>
      {sparkle &&
        dots.map((d) => (
          <View
            key={d.key}
            style={{
              position: "absolute",
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              borderRadius: 999,
              backgroundColor: "#FFF",
              opacity: d.opacity,
            }}
          />
        ))}
    </View>
  );
}

/* =============== Rainbow Halo =============== */
function RainbowHalo({
  diameter,
  colors,
  pulseMs = 1400,
  spread = 0.26,
}: {
  diameter: number;
  colors: string[];
  pulseMs?: number;
  spread?: number;
}) {
  const anim = useMemo(() => new Animated.Value(0), []);
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: pulseMs,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: pulseMs,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [anim, pulseMs]);

  const base = diameter;
  const layers = colors.slice(0, 5);
  return (
    <View
      style={{
        position: "absolute",
        width: base * (1 + spread),
        height: base * (1 + spread),
        left: -(base * spread) / 2,
        top: -(base * spread) / 2,
      }}
      pointerEvents="none"
    >
      {layers.map((c, i) => {
        const k = 1 + (i + 1) * (spread / layers.length);
        const op = 0.1 - i * 0.015;
        const scale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.025 + i * 0.01],
        });
        return (
          <Animated.View
            key={`halo-${i}`}
            style={{
              position: "absolute",
              left: (base * (1 + spread) - base * k) / 2,
              top: (base * (1 + spread) - base * k) / 2,
              width: base * k,
              height: base * k,
              borderRadius: (base * k) / 2,
              backgroundColor: c,
              opacity: op,
              transform: [{ scale }],
            }}
          />
        );
      })}
    </View>
  );
}

/* =============== Fireworks =============== */
function Fireworks({
  colors,
  particleCount = 26,
  durationMs = 900,
  loopMs,
}: {
  colors: string[];
  particleCount?: number;
  durationMs?: number;
  loopMs?: number;
}) {
  const parts = useMemo(() => {
    return new Array(particleCount).fill(0).map((_, idx) => ({
      key: `p-${idx}`,
      color: colors[idx % colors.length],
      angle: (Math.PI * 2 * idx) / particleCount + Math.random() * 0.22,
      distance: 18 + Math.random() * 24,
      size: 3.5 + Math.random() * 2.5,
      anim: new Animated.Value(0),
    }));
  }, [colors, particleCount]);

  const run = () => {
    Animated.stagger(
      6,
      parts.map((p) =>
        Animated.timing(p.anim, {
          toValue: 1,
          duration: durationMs,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      )
    ).start(() => parts.forEach((p) => p.anim.setValue(0)));
  };

  useEffect(() => {
    run();
    if (loopMs && loopMs > 0) {
      const id = setInterval(run, loopMs);
      return () => clearInterval(id);
    }
  }, [loopMs]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {parts.map((p) => {
        const tx = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(p.angle) * p.distance],
        });
        const ty = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(p.angle) * p.distance],
        });
        const scale = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.2, 1],
        });
        const opacity = p.anim.interpolate({
          inputRange: [0, 0.6, 1],
          outputRange: [0.9, 1, 0],
        });
        return (
          <Animated.View
            key={p.key}
            style={{
              position: "absolute",
              left: "50%",
              top: 6,
              transform: [
                { translateX: -2 },
                { translateY: -2 },
                { translateX: tx },
                { translateY: ty },
                { scale },
              ],
              opacity,
              width: p.size,
              height: p.size,
              borderRadius: 999,
              backgroundColor: p.color,
            }}
          />
        );
      })}
    </View>
  );
}

/* =============== Main (no pedestal) =============== */
export default function PodiumTop123({
  winners,
  containerStyle,
  onPressRank,
  onPressWinner,
  sizes,
  theme = DEFAULT_THEME,
  useEmojiMedals = false, // <-- mặc định: huy chương TOP số đẹp, không emoji
  avatarOffsetY = { main: -6, side: -10 },
  ring = { width: 2.2, innerWidth: 1.2 },
  renderCrown,
  renderAvatar,
  fireworks = {
    enabled: true,
    loopMs: 3000,
    particleCount: 26,
    durationMs: 900,
  },
  halo = { forAll: true, enabled: true, pulseMs: 1400, spread: 0.26 },
  sparkle = { enabled: true },
}: PodiumTop123Props) {
  const [first, second, third] =
    winners || ([] as unknown as [Winner, Winner, Winner]);

  const scale = sizes?.overallScale ?? 0.9;
  const laneW = laneWidthBase * scale;

  const mainSize = (sizes?.mainAvatar ?? 88) * scale;
  const sideSize = (sizes?.sideAvatar ?? 72) * scale;

  const safe = (w?: Winner): Winner =>
    w ?? { id: undefined, name: "", avatarUri: undefined, badgeText: "" };
  const w1 = safe(first);
  const w2 = safe(second);
  const w3 = safe(third);

  const press = (winner: Winner, rank: Rank) => {
    if (onPressWinner) onPressWinner({ winner, rank });
    else onPressRank?.(rank);
  };

  const CrownOrMedal = ({ rank }: { rank: Rank }): ReactNode =>
    renderCrown ? (
      renderCrown({ rank })
    ) : (
      <TopMedalBadge
        rank={rank}
        useEmoji={useEmojiMedals}
        theme={theme}
        size={30 * scale}
      />
    );

  const AvatarNode = ({
    data,
    size,
    rank,
  }: {
    data: Winner;
    size: number;
    rank: Rank;
  }): ReactNode =>
    renderAvatar ? (
      renderAvatar({
        uri: data.avatarUri,
        size,
        fallback: getInitials(data.name),
        rank,
        theme,
      })
    ) : (
      <View>
        {/* Medal TOP gắn góc trái trên */}
        <View style={{ position: "absolute", left: -6, top: -12, zIndex: 2 }}>
          <CrownOrMedal rank={rank} />
        </View>

        {/* Halo */}
        {(halo.enabled ?? true) && (halo.forAll || rank === 1) && (
          <RainbowHalo
            diameter={size * 1.08}
            colors={theme.haloColors || DEFAULT_THEME.haloColors!}
            pulseMs={halo.pulseMs}
            spread={halo.spread}
          />
        )}

        <Avatar
          uri={data.avatarUri}
          size={size}
          fallback={getInitials(data.name)}
          theme={theme}
          ringWidth={ring.width}
          ring2Width={ring.innerWidth}
          sparkle={sparkle.enabled}
        />
      </View>
    );

  return (
    <View
      style={[styles.container, { width: podWidth * scale }, containerStyle]}
    >
      {fireworks.enabled && (
        <Fireworks
          colors={theme.fireworkColors}
          particleCount={fireworks.particleCount}
          durationMs={fireworks.durationMs}
          loopMs={fireworks.loopMs}
        />
      )}

      {/* Avatars-only row */}
      <View style={styles.avatarsRow}>
        {/* #2 */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => press(w2, 2)}
          style={[
            styles.lane,
            {
              width: laneW,
              transform: [{ translateY: avatarOffsetY?.side ?? -10 }],
            },
          ]}
        >
          <AvatarNode data={w2} size={sideSize} rank={2} />
          <FramedDetails
            rank={2}
            name={w2.name}
            badge={w2.badgeText}
            theme={theme}
          />
        </TouchableOpacity>

        {/* #1 */}
        <TouchableOpacity
          activeOpacity={0.98}
          onPress={() => press(w1, 1)}
          style={[
            styles.lane,
            {
              width: laneW,
              transform: [{ translateY: avatarOffsetY?.main ?? -6 }],
            },
          ]}
        >
          <AvatarNode data={w1} size={mainSize} rank={1} />
          <FramedDetails
            rank={1}
            name={w1.name}
            badge={w1.badgeText}
            theme={theme}
            emphasize
          />
        </TouchableOpacity>

        {/* #3 */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => press(w3, 3)}
          style={[
            styles.lane,
            {
              width: laneW,
              transform: [{ translateY: avatarOffsetY?.side ?? -10 }],
            },
          ]}
        >
          <AvatarNode data={w3} size={sideSize} rank={3} />
          <FramedDetails
            rank={3}
            name={w3.name}
            badge={w3.badgeText}
            theme={theme}
          />
        </TouchableOpacity>
      </View>

      {/* ground nhẹ (tuỳ chọn) */}
      <View style={styles.baseFade} pointerEvents="none" />
    </View>
  );
}

/* =============== styles =============== */
const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    paddingVertical: 8,
  },
  avatarsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  lane: {
    alignItems: "center",
  },
  baseFade: {
    marginTop: 4,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignSelf: "center",
    width: "70%",
    opacity: 0.4,
  },
});
