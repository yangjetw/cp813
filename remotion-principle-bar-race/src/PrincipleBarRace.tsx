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
const valueLeft = barLeft + barMaxWidth + 36;

const palette = [
  "#2f7f82",
  "#6c9f8b",
  "#d8a748",
  "#e06f83",
  "#5d8db7",
  "#8f7aa8",
  "#b47c55",
  "#6f8d57",
  "#bf8f3e",
  "#4f9a9b",
  "#c77972",
  "#7f7566",
];

const getItem = (frame: YearFrame, name: string) =>
  frame.items.find((item) => item.name === name) ?? { name, value: 0, rank: meta.principleCount, yearly: 0 };

const smooth = (value: number) => Easing.inOut(Easing.cubic)(value);

const hashName = (name: string) =>
  [...name].reduce((total, char, index) => total + char.charCodeAt(0) * (index + 5), 0);

const colorForName = (name: string) => palette[hashName(name) % palette.length];

const positiveRankMap = (yearFrame: YearFrame) =>
  new Map(
    yearFrame.items
      .filter((item) => item.value > 0)
      .map((item, index) => [item.name, index + 1]),
  );

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
  const yearAdded = next.items.reduce((total, item) => total + item.yearly, 0);
  const intro = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });

  const currentRanks = positiveRankMap(current);
  const nextRanks = positiveRankMap(next);
  const names = [
    ...new Set([
      ...current.items.filter((item) => item.value > 0).map((item) => item.name),
      ...next.items.filter((item) => item.value > 0).map((item) => item.name),
    ]),
  ];
  const items = names
    .map((name) => {
      const a = getItem(current, name);
      const b = getItem(next, name);
      const value = interpolate(local, [0, 1], [a.value, b.value]);
      const startRank = currentRanks.get(name) ?? (nextRanks.get(name) ?? meta.principleCount) + 3;
      const endRank = nextRanks.get(name) ?? currentRanks.get(name) ?? meta.principleCount;
      const rank = interpolate(local, [0, 1], [startRank, endRank]);
      return {
        name,
        value,
        displayValue: Math.round(value),
        rank,
        finalRank: b.rank,
        yearly: b.yearly,
        isEntering: !currentRanks.has(name) && nextRanks.has(name),
      };
    })
    .filter((item) => item.value > 0.01)
    .sort((a, b) => a.rank - b.rank);
  const totalNow = Math.round(items.reduce((total, item) => total + item.value, 0));

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
          right: 106,
          top: 84,
          fontFamily: fontHand,
          fontSize: 118,
          color: colors.pink,
          opacity: 0.82,
          fontWeight: 900,
          transform: "rotate(-2deg)",
          textShadow: "3px 4px 0 rgba(255,255,255,.9)",
        }}
      >
        {year}
      </div>

      <div
        style={{
          position: "absolute",
          right: 116,
          top: 218,
          display: "flex",
          alignItems: "center",
          gap: 14,
          color: colors.muted,
          fontWeight: 900,
          fontSize: 28,
        }}
      >
        <span>總累積 {totalNow}</span>
        <span
          style={{
            color: yearAdded > 0 ? colors.pink : "rgba(109,97,85,.42)",
            fontFamily: fontHand,
            fontSize: 34,
            transform: `scale(${yearAdded > 0 ? 1 + Math.sin(local * Math.PI) * 0.18 : 1})`,
            display: "inline-block",
          }}
        >
          +{yearAdded}
        </span>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 0 }}>
        {items.map((item, visibleIndex) => {
          const rankForStyle = visibleIndex + 1;
          const isTop = rankForStyle <= 15;
          const height = rowHeight(rankForStyle);
          const y = rowY(rankForStyle);
          const width = maxValue > 0 ? interpolate(item.value, [0, maxValue], [0, barMaxWidth]) : 0;
          const appearProgress = item.isEntering ? local : 1;
          const opacity = (isTop ? 1 : 0.46) * interpolate(appearProgress, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const fontSize = isTop ? 22 : 13;
          const rankSize = isTop ? 24 : 13;
          const barColor = colorForName(item.name);
          const plusScale = item.yearly > 0 ? 1 + Math.sin(local * Math.PI) * 0.24 : 1;
          const laneRankDelta = item.rank - rankForStyle;
          const runPush = interpolate(Math.abs(laneRankDelta), [0, 1.2], [0, 26], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
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
                transform: `translateX(${(1 - appearProgress) * -58 + runPush}px)`,
                zIndex: 100 - rankForStyle,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  width: 74,
                  top: -1,
                  color: barColor,
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
                  background: "rgba(64,56,47,.095)",
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
                  background: barColor,
                  boxShadow: isTop ? `4px 5px 0 ${colors.shadow}` : "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: valueLeft - chartLeft,
                  top: -2,
                  width: 82,
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
              <div
                style={{
                  position: "absolute",
                  left: valueLeft - chartLeft + 96,
                  top: isTop ? -5 : -3,
                  minWidth: isTop ? 58 : 38,
                  padding: isTop ? "1px 8px 3px" : "0 6px 1px",
                  borderRadius: 999,
                  border: `2px solid ${item.yearly > 0 ? barColor : "rgba(109,97,85,.22)"}`,
                  background: item.yearly > 0 ? "rgba(255,250,240,.92)" : "rgba(255,250,240,.45)",
                  color: item.yearly > 0 ? barColor : "rgba(109,97,85,.35)",
                  fontFamily: fontHand,
                  fontWeight: 900,
                  fontSize: isTop ? 20 : 12,
                  lineHeight: isTop ? "24px" : "16px",
                  textAlign: "center",
                  transform: `scale(${plusScale})`,
                  transformOrigin: "left center",
                }}
              >
                +{item.yearly}
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
