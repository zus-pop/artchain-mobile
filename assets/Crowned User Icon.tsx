import * as React from "react";
import {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Svg,
  Image as SvgImage,
  Text as SvgText,
} from "react-native-svg";

export type Rank = 1 | 2 | 3;

export interface CrownedUserIconProps extends React.SVGProps<SVGSVGElement> {
  rank?: Rank;
  size?: number | string;
  variant?: "color" | "mono";
  withGradient?: boolean;
  showLaurel?: boolean;
  showRibbon?: boolean;
  glow?: boolean; // chỉ vẽ ellipse shadow nhẹ (không filter)
  showRing?: boolean;
  strokeWidth?: number;
  colors?: {
    goldStart?: string;
    goldEnd?: string;
    silverStart?: string;
    silverEnd?: string;
    bronzeStart?: string;
    bronzeEnd?: string;
    skin?: string;
    shirt?: string;
    bg?: string;
    ring?: string;
    text?: string;
    ribbon?: string;
    laurel?: string;
  };
  avatarUrl?: string;
  renderAvatar?: (diameter: number) => React.ReactNode;
  avatarFit?: "cover" | "contain";
  avatarBorder?: boolean;
  initials?: string;
  initialsBg?: string;
  initialsColor?: string;
  ariaLabel?: string;
  className?: string;
}

const DEFAULTS = {
  size: 112,
  strokeWidth: 0,
  colors: {
    goldStart: "#F8D775",
    goldEnd: "#E8B63B",
    silverStart: "#DCE1E8",
    silverEnd: "#B9C2CF",
    bronzeStart: "#D29A6B",
    bronzeEnd: "#B87947",
    skin: "#F3D4B5",
    shirt: "#4F46E5",
    bg: "#F3F4F6",
    ring: "#D1D5DB",
    text: "#111827",
    ribbon: "#111827",
    laurel: "#22C55E",
  },
  avatar: {
    fit: "cover" as const,
    border: false,
    initialsBg: "#CBD5E1",
    initialsColor: "#111827",
  },
} as const;

const CrownedUserIcon = React.memo(
  React.forwardRef<SVGSVGElement, CrownedUserIconProps>(
    function CrownedUserIcon(
      {
        rank = 1,
        size = DEFAULTS.size,
        variant = "color",
        withGradient = true,
        showLaurel = true,
        showRibbon = true,
        glow = true, // ellipse shadow nhẹ
        showRing = true,
        strokeWidth = DEFAULTS.strokeWidth,
        colors = {},
        avatarUrl,
        renderAvatar,
        avatarFit = DEFAULTS.avatar.fit,
        avatarBorder = DEFAULTS.avatar.border,
        initials,
        initialsBg = DEFAULTS.avatar.initialsBg,
        initialsColor = DEFAULTS.avatar.initialsColor,
        ariaLabel,
        className,
        ...rest
      },
      ref
    ) {
      const c = { ...DEFAULTS.colors, ...colors };
      const isMono = variant === "mono";

      const gradId = React.useId();
      const crownGradId = `${gradId}-crown`;
      const label = ariaLabel ?? `Người dùng đạt Top ${rank}`;

      const colorPair = (() => {
        if (isMono) return { start: "currentColor", end: "currentColor" };
        if (rank === 1) return { start: c.goldStart, end: c.goldEnd };
        if (rank === 2) return { start: c.silverStart, end: c.silverEnd };
        return { start: c.bronzeStart, end: c.bronzeEnd };
      })();

      const fillText = isMono ? "currentColor" : c.text;
      const fillSkin = isMono ? "currentColor" : c.skin;
      const fillShirt = isMono ? "currentColor" : c.shirt;
      const fillBg = isMono ? "currentColor" : c.bg;
      const fillRing = isMono ? "currentColor" : c.ring;
      const fillRibbon = isMono ? "currentColor" : c.ribbon;
      const fillLaurel = isMono ? "currentColor" : c.laurel;

      const oRing = isMono ? 0.22 : 1;
      const oBg = isMono ? 0.1 : 1;
      const oShirt = isMono ? 0.35 : 1;
      const oSkin = isMono ? 0.7 : 1;
      const oText = isMono ? 0.95 : 1;
      const oLaurel = isMono ? 0.45 : 1;

      return (
        <Svg
          ref={ref}
          accessibilityRole="image"
          accessibilityLabel={label}
          width={size}
          height={size}
          viewBox="0 0 112 128"
          preserveAspectRatio="xMidYMid meet"
          {...rest}
        >
          <Defs>
            {withGradient && (
              <LinearGradient id={crownGradId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={colorPair.start} />
                <Stop offset="100%" stopColor={colorPair.end} />
              </LinearGradient>
            )}
            <ClipPath id={`${gradId}-avatar-clip`}>
              <Circle cx={56} cy={68} r={44} />
            </ClipPath>
          </Defs>

          {/* Outer ring */}
          {showRing && (
            <Circle cx={56} cy={68} r={52} fill={fillRing} opacity={oRing} />
          )}

          {/* Avatar circle */}
          <Circle cx={56} cy={68} r={44} fill={fillBg} opacity={oBg} />

          {/* Avatar content */}
          {(() => {
            const diameter = 88,
              x = 56 - 44,
              y = 68 - 44;
            const preserve =
              avatarFit === "cover" ? "xMidYMid slice" : "xMidYMid meet";
            return (
              <G clipPath={`url(#${gradId}-avatar-clip)`}>
                {renderAvatar ? (
                  <G>{renderAvatar(diameter) as any}</G>
                ) : avatarUrl ? (
                  <SvgImage
                    href={{ uri: avatarUrl }}
                    x={x}
                    y={y}
                    width={diameter}
                    height={diameter}
                    preserveAspectRatio={preserve as any}
                  />
                ) : initials ? (
                  <>
                    <Rect
                      x={x}
                      y={y}
                      width={diameter}
                      height={diameter}
                      fill={initialsBg}
                    />
                    <SvgText
                      x={56}
                      y={72}
                      fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
                      fontWeight="800"
                      fontSize={28}
                      textAnchor="middle"
                      fill={initialsColor}
                    >
                      {initials}
                    </SvgText>
                  </>
                ) : null}

                {avatarBorder && (
                  <Circle
                    cx={56}
                    cy={68}
                    r={44}
                    fill="none"
                    stroke={fillText}
                    strokeOpacity={0.08}
                    strokeWidth={2}
                  />
                )}
              </G>
            );
          })()}

          {/* Laurel */}
          {showLaurel && (
            <G fill={fillLaurel} opacity={oLaurel} transform="translate(56,72)">
              {/* right */}
              <G>
                <Path d="M0 -28c12 4 20 14 22 26" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <Ellipse
                    key={`r${i}`}
                    cx={10 + i * 4}
                    cy={-12 + i * 6}
                    rx={2.4}
                    ry={4.2}
                    transform={`rotate(${12 + i * 7} ${10 + i * 4} ${
                      -12 + i * 6
                    })`}
                  />
                ))}
              </G>
              {/* left mirror */}
              <G transform="scale(-1,1)">
                <Path d="M0 -28c12 4 20 14 22 26" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <Ellipse
                    key={`l${i}`}
                    cx={10 + i * 4}
                    cy={-12 + i * 6}
                    rx={2.4}
                    ry={4.2}
                    transform={`rotate(${12 + i * 7} ${10 + i * 4} ${
                      -12 + i * 6
                    })`}
                  />
                ))}
              </G>
            </G>
          )}

          {/* Fallback silhouette */}
          {!avatarUrl && !renderAvatar && !initials && (
            <>
              <Circle
                cx={56}
                cy={56}
                r={14}
                fill={fillSkin}
                opacity={oSkin}
                stroke={strokeWidth ? fillText : "none"}
                strokeWidth={strokeWidth}
              />
              <Path
                d="M28 92c3.5-13.5 16-22 28-22s24.5 8.5 28 22v6H28v-6z"
                fill={fillShirt}
                opacity={oShirt}
                stroke={strokeWidth ? fillText : "none"}
                strokeWidth={strokeWidth}
              />
            </>
          )}

          {/* Crown group (ellipse shadow nhẹ) */}
          <G transform="translate(28,8)">
            {glow && (
              <Ellipse
                cx={28}
                cy={30}
                rx={14}
                ry={3}
                fill={fillText}
                opacity={0.06}
              />
            )}
            <Path
              d="M12 10l7 7 9-11 9 11 7-7 2.2 18H9.8L12 10z"
              fill={withGradient ? `url(#${crownGradId})` : colorPair.start}
              stroke={strokeWidth ? fillText : "none"}
              strokeWidth={strokeWidth}
            />
            <Rect
              x={10}
              y={26}
              width={36}
              height={7}
              rx={3.5}
              fill={fillText}
              opacity={0.12}
            />
            <Circle
              cx={28}
              cy={29.5}
              r={6.5}
              fill={isMono ? "currentColor" : "#FFFFFF"}
              opacity={isMono ? 0.9 : 1}
            />
            <G fill={isMono ? "currentColor" : "#FFFFFF"} opacity={0.9}>
              <Path
                d="M18 16l1.8 3.8 3.8 1.8-3.8 1.8L18 27.2l-1.8-3.8-3.8-1.8 3.8-1.8 1.8-3.8z"
                opacity={0.35}
              />
              <Path
                d="M38 14l1.2 2.6 2.6 1.2-2.6 1.2L38 21.8l-1.2-2.6-2.6-1.2 2.6-1.2 1.2-2.6z"
                opacity={0.25}
              />
            </G>
            <SvgText
              x={28}
              y={31}
              fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
              fontWeight="800"
              fontSize={9}
              textAnchor="middle"
              fill={fillText}
              opacity={oText}
            >
              {rank}
            </SvgText>
          </G>

          {/* Ribbon label */}
          {showRibbon && (
            <G transform="translate(24,104)">
              <Rect
                x={0}
                y={0}
                width={64}
                height={16}
                rx={8}
                fill={fillRibbon}
                opacity={isMono ? 0.9 : 1}
              />
              <SvgText
                x={32}
                y={11.5}
                fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
                fontWeight="700"
                fontSize={10}
                textAnchor="middle"
                fill="#FFFFFF"
              >
                TOP {rank}
              </SvgText>
            </G>
          )}
        </Svg>
      );
    }
  )
);

export default CrownedUserIcon;
