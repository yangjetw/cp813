import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import frames from "./data/principle-race.json";
import summary from "./data/summary.json";
import { colors, fontHand, fontSans } from "./style";

type RaceItem = {
  name: string;
  value: number;
  rank: number;
  yearly: number;
};

type YearFrame = {
  year: number;
  max: number;
  items: RaceItem[];
};

const data = frames as YearFrame[];
const meta = summary as {
  minYear: number;
  maxYear: number;
  principleCount: number;
  maxValue: number;
};

const introFrames = 90;
const outroFrames = 240;
const rowGap = 4;
const topHeight = 23;
const bottomHeight = 11;
const chartTop = 292;
const chartLeft = 92;
const nameWidth = 452;
const barLeft = chartLeft + nameWidth;
const barMaxWidth = 1040;
const valueLeft = barLeft + barMaxWidth + 44;

const getItem = (frame: YearFrame, name: string) =>
  frame.items.find((item) => item.name === name) ?? { name, value: 0, rank: meta.principleCount, yearly: 0 };

const smooth = (value: number) => Easing.inOut(Easing.cubic)(value);

const rowY = (rank: number) => {
  const before = rank - 1;
  const topRows = Math.min(before, 15);
  const bottomRows = Math.max(0, before - 15);
  return chartTop + topRows * (topHeight + rowGap) + bottomRows * (bottomHeight + 3);
};

const rowHeight = (rank: number) => (rank <= 15 ? topHeight : bottomHeight);

export const PrincipleBarRace = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const activeDuration = durationInFrames - introFrames - outroFrames;
  const activeFrame = Math.min(Math.max(frame - introFrames, 0), activeDuration);
  const progress = activeFrame / activeDuration;
  const exactIndex = interpolate(progress, [0, 1], [0, data.length - 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lowerIndex = Math.floor(exactIndex);
  const upperIndex = Math.min(lowerIndex + 1, data.length - 1);
  const local = smooth(exactIndex - lowerIndex);
  const current = data[lowerIndex];
  const next = data[upperIndex];
  const year = Math.round(interpolate(local, [0, 1], [current.year, next.year]));
  const maxValue = interpolate(local, [0, 1], [current.max, next.max]);
  const intro = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });

  const names = current.items.map((item) => item.name);
  const items = names.map((name) => {
    const a = getItem(current, name);
    const b = getItem(next, name);
    const value = interpolate(local, [0, 1], [a.value, b.value]);
    const rank = interpolate(local, [0, 1], [a.rank, b.rank]);
    return {
      name,
      value,
      displayValue: Math.round(value),
      rank,
      finalRank: b.rank,
      yearly: b.yearly,
    };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.paper,
        backgroundImage:
          "linear-gradient(rgba(74,163,162,.13) 2px, transparent 2px), radial-gradient(circle at 75% 25%, rgba(243,201,105,.18), transparent 32%)",
        backgroundSize: "100% 42px, 100% 100%",
        color: colors.ink,
        fontFamily: fontSans,
        overflow: "hidden",
        opacity: interpolate(intro, [0, 1], [0, 1]),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 36,
          border: `5px solid ${colors.line}`,
          borderRadius: 28,
          boxShadow: `12px 14px 0 ${colors.shadow}`,
          background:
            "linear-gradient(90deg, rgba(255,250,240,.74), rgba(255,250,240,.34), rgba(255,250,240,.74))",
        }}
      />

      <header style={{ position: "absolute", left: 88, top: 56, right: 88 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 20,
            padding: "9px 22px 11px",
            border: `4px solid ${colors.line}`,
            borderRadius: "26px 18px 24px 16px",
            background: "#d7eee2",
            boxShadow: `7px 8px 0 ${colors.shadow}`,
            color: colors.teal,
            fontWeight: 900,
            fontSize: 32,
          }}
        >
          動態排名
        </div>
        <h1
          style={{
            margin: "22px 0 0",
            fontSize: 66,
            lineHeight: 1.08,
            letterSpacing: 0,
            textShadow: `4px 5px 0 rgba(243,201,105,.52)`,
          }}
        >
          憲法原則引用累積排名
        </h1>
        <div
          style={{
            marginTop: 10,
            color: colors.muted,
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          1949-2021｜30 項憲法原則逐年累積
        </div>
      </header>

      <div
        style={{
          position: "absolute",
          right: 112,
          top: 92,
          fontFamily: fontHand,
          fontSize: 126,
          color: colors.pink,
          opacity: 0.82,
          fontWeight: 900,
          transform: "rotate(-2deg)",
          textShadow: "3px 4px 0 rgba(255,255,255,.9)",
        }}
      >
        {year}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 0 }}>
        {items.map((item) => {
          const rankForStyle = Math.round(item.rank);
          const isTop = rankForStyle <= 15;
          const height = rowHeight(rankForStyle);
          const y = rowY(item.rank);
          const width = maxValue > 0 ? interpolate(item.value, [0, maxValue], [0, barMaxWidth]) : 0;
          const opacity = isTop ? 1 : 0.48;
          const fontSize = isTop ? 22 : 13;
          const rankSize = isTop ? 24 : 13;
          return (
            <div
              key={item.name}
              style={{
                position: "absolute",
                left: chartLeft,
                top: y,
                width: 1740,
                height,
                opacity,
                transition: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  width: 74,
                  top: -1,
                  color: colors.teal,
                  fontFamily: fontHand,
                  fontWeight: 900,
                  fontSize: rankSize,
                  lineHeight: `${height}px`,
                }}
              >
                {String(rankForStyle).padStart(2, "0")}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 94,
                  width: nameWidth - 120,
                  top: 0,
                  fontWeight: 950,
                  fontSize,
                  lineHeight: `${height}px`,
                  color: isTop ? colors.ink : colors.muted,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.name}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: nameWidth,
                  top: height / 2 - 1,
                  width: barMaxWidth,
                  height: 4,
                  borderRadius: 999,
                  background: "rgba(64,56,47,.10)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: nameWidth,
                  top: 0,
                  width,
                  height,
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${colors.tealLight}, ${colors.yellow})`,
                  boxShadow: isTop ? `4px 5px 0 ${colors.shadow}` : "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: valueLeft - chartLeft,
                  top: -2,
                  width: 120,
                  textAlign: "right",
                  color: colors.muted,
                  fontFamily: fontHand,
                  fontWeight: 900,
                  fontSize: isTop ? 24 : 13,
                  lineHeight: `${height}px`,
                }}
              >
                {item.displayValue > 0 ? item.displayValue : ""}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 88,
          right: 88,
          bottom: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 28,
          color: colors.muted,
          fontSize: 24,
          fontWeight: 800,
        }}
      >
        <span>資料來源：釋字文本憲法原則逐年引用篇數表</span>
        <span style={{ color: colors.teal }}>前 15 名強調，後 15 名淡化顯示</span>
      </div>
    </AbsoluteFill>
  );
};
