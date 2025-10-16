import * as React from "react";
import { Ellipse, G, Rect, Svg, Text as SvgText } from "react-native-svg";
import CrownedUserIcon from "./Crowned User Icon";

export interface PodiumWithCrownedUsersProps
  extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  userSize?: number;
  variant?: "mono" | "color";
  withGradient?: boolean;
  showLaurel?: boolean;
  showRibbon?: boolean;
  glow?: boolean;
  showRing?: boolean;
  strokeWidth?: number;
  colors?: {
    gold?: string;
    silver?: string;
    bronze?: string;
    shadow?: string;
    text?: string;
  };
  avatarUrl1?: string;
  initials1?: string;
  avatarUrl2?: string;
  initials2?: string;
  avatarUrl3?: string;
  initials3?: string;
  showBlockLabels?: boolean;
  crownProps1?: Partial<React.ComponentProps<typeof CrownedUserIcon>>;
  crownProps2?: Partial<React.ComponentProps<typeof CrownedUserIcon>>;
  crownProps3?: Partial<React.ComponentProps<typeof CrownedUserIcon>>;
  className?: string;
}

const DEFAULTS = {
  width: 640,
  height: 420,
  userSize: 120,
  colors: {
    gold: "#F4C84A",
    silver: "#C9CED6",
    bronze: "#C58A5B",
    shadow: "#E9ECEF",
    text: "#1F2937",
  },
} as const;

const PodiumWithCrownedUsers = React.memo(
  React.forwardRef<SVGSVGElement, PodiumWithCrownedUsersProps>(function Podium(
    {
      width = DEFAULTS.width,
      height = DEFAULTS.height,
      userSize = DEFAULTS.userSize,
      variant = "color",
      withGradient = true,
      showLaurel = true,
      showRibbon = true,
      glow = true,
      showRing = true,
      strokeWidth = 0,
      colors = {},
      avatarUrl1,
      avatarUrl2,
      avatarUrl3,
      initials1,
      initials2,
      initials3,
      showBlockLabels = true,
      crownProps1,
      crownProps2,
      crownProps3,
      className,
      ...rest
    },
    ref
  ) {
    const c = { ...DEFAULTS.colors, ...colors };

    const W = 640,
      H = 420;
    const centerX = W / 2,
      baseY = 360;
    const w = 150,
      h1 = 140,
      h2 = 110,
      h3 = 90,
      gap = 30;

    const x1 = centerX - w / 2;
    const x2 = x1 - w - gap;
    const x3 = x1 + w + gap;

    const y1 = baseY - h1;
    const y2 = baseY - h2;
    const y3 = baseY - h3;

    const iconYOffset = 24;
    const icon1x = x1 + w / 2 - userSize / 2;
    const icon1y = y1 - userSize + iconYOffset;
    const icon2x = x2 + w / 2 - userSize / 2;
    const icon2y = y2 - userSize + iconYOffset + 8;
    const icon3x = x3 + w / 2 - userSize / 2;
    const icon3y = y3 - userSize + iconYOffset + 12;

    const common = {
      size: userSize,
      variant,
      withGradient,
      showLaurel,
      showRibbon,
      glow,
      showRing,
      strokeWidth,
    };

    return (
      <Svg
        ref={ref}
        width={width}
        height={height}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        accessibilityRole="image"
        accessibilityLabel="Podium with Crowned Users"
        {...rest}
      >
        {/* Ground shadow */}
        <Ellipse
          cx={centerX}
          cy={baseY + 12}
          rx={220}
          ry={12}
          fill={c.shadow}
        />

        {/* Blocks */}
        <Rect x={x2} y={y2} width={w} height={h2} rx={12} fill={c.silver} />
        <Rect x={x1} y={y1} width={w} height={h1} rx={14} fill={c.gold} />
        <Rect x={x3} y={y3} width={w} height={h3} rx={12} fill={c.bronze} />

        {/* Numbers */}
        <G>
          <SvgText
            x={x1 + w / 2}
            y={y1 + h1 / 2}
            fontSize={36}
            fontWeight="800"
            textAnchor="middle"
            fill={c.text}
          >
            1
          </SvgText>
          <SvgText
            x={x2 + w / 2}
            y={y2 + h2 / 2}
            fontSize={28}
            fontWeight="800"
            textAnchor="middle"
            fill={c.text}
          >
            2
          </SvgText>
          <SvgText
            x={x3 + w / 2}
            y={y3 + h3 / 2}
            fontSize={24}
            fontWeight="800"
            textAnchor="middle"
            fill={c.text}
          >
            3
          </SvgText>
        </G>

        {/* Labels */}
        {showBlockLabels && (
          <G>
            <SvgText
              x={x1 + w / 2}
              y={baseY - 8}
              fontSize={12}
              fontWeight="600"
              textAnchor="middle"
              fill="#6B7280"
            >
              TOP 1
            </SvgText>
            <SvgText
              x={x2 + w / 2}
              y={baseY - 8}
              fontSize={11}
              fontWeight="600"
              textAnchor="middle"
              fill="#6B7280"
            >
              TOP 2
            </SvgText>
            <SvgText
              x={x3 + w / 2}
              y={baseY - 8}
              fontSize={11}
              fontWeight="600"
              textAnchor="middle"
              fill="#6B7280"
            >
              TOP 3
            </SvgText>
          </G>
        )}

        {/* Crowned user icons */}
        <Svg
          x={icon1x}
          y={icon1y}
          width={userSize}
          height={userSize}
          viewBox={`0 0 ${userSize} ${userSize}`}
        >
          <CrownedUserIcon
            rank={1}
            {...common}
            {...crownProps1}
            avatarUrl={avatarUrl1}
            initials={initials1}
          />
        </Svg>
        <Svg
          x={icon2x}
          y={icon2y}
          width={userSize}
          height={userSize}
          viewBox={`0 0 ${userSize} ${userSize}`}
        >
          <CrownedUserIcon
            rank={2}
            {...common}
            {...crownProps2}
            avatarUrl={avatarUrl2}
            initials={initials2}
          />
        </Svg>
        <Svg
          x={icon3x}
          y={icon3y}
          width={userSize}
          height={userSize}
          viewBox={`0 0 ${userSize} ${userSize}`}
        >
          <CrownedUserIcon
            rank={3}
            {...common}
            {...crownProps3}
            avatarUrl={avatarUrl3}
            initials={initials3}
          />
        </Svg>
      </Svg>
    );
  })
);

export default PodiumWithCrownedUsers;
