import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..");
const sourceCsv = "C:\\Users\\je235\\Downloads\\第五章量化 - 5_07_各原則逐年引用篇數表.csv";
const outDir = path.resolve(projectRoot, "remotion-principle-bar-race", "src", "data");

const text = fs.readFileSync(sourceCsv, "utf8").replace(/^\uFEFF/, "");
const lines = text.trim().split(/\r?\n/);
const headers = lines.shift().split(",");

const yearKey = headers[0];
const principleKey = headers[1];
const countKey = headers[2];

const parseCsvLine = (line) => {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
};

const rows = lines.map((line) => {
  const cells = parseCsvLine(line);
  return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
});

const principles = [...new Set(rows.map((row) => row[principleKey]))].sort((a, b) =>
  a.localeCompare(b, "zh-Hant"),
);
const years = rows.map((row) => Number(row[yearKey])).filter(Number.isFinite);
const minYear = Math.min(1949, ...years);
const maxYear = Math.max(2021, ...years);

const yearlyCounts = new Map();
for (const row of rows) {
  const year = Number(row[yearKey]);
  const name = row[principleKey];
  const count = Number(row[countKey] || 0);
  if (!Number.isFinite(year) || !name || !Number.isFinite(count)) continue;
  const key = `${year}::${name}`;
  yearlyCounts.set(key, (yearlyCounts.get(key) ?? 0) + count);
}

const totals = new Map(principles.map((name) => [name, 0]));
const frames = [];

for (let year = minYear; year <= maxYear; year += 1) {
  for (const name of principles) {
    totals.set(name, (totals.get(name) ?? 0) + (yearlyCounts.get(`${year}::${name}`) ?? 0));
  }

  const sorted = principles
    .map((name) => ({
      name,
      value: totals.get(name) ?? 0,
      yearly: yearlyCounts.get(`${year}::${name}`) ?? 0,
    }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, "zh-Hant"))
    .map((item, index) => ({ ...item, rank: index + 1 }));

  frames.push({
    year,
    max: sorted[0]?.value ?? 0,
    items: sorted,
  });
}

const finalFrame = frames.at(-1);
const summary = {
  minYear,
  maxYear,
  principleCount: principles.length,
  maxValue: finalFrame?.max ?? 0,
  finalTop10: finalFrame?.items.slice(0, 10) ?? [],
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "principle-race.json"), `${JSON.stringify(frames, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(outDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");

console.log(`Wrote ${frames.length} yearly frames for ${principles.length} principles.`);
for (const item of summary.finalTop10.slice(0, 5)) {
  console.log(`${item.rank}. ${item.name} ${item.value}`);
}
