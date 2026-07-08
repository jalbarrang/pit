import { writeFileSync } from "node:fs";
import { Markdown, TUI, type MarkdownTheme } from "../src/index.ts";

const theme: MarkdownTheme = {
  heading: { fg: "#88C0D0", bold: true },
  link: { fg: "#81A1C1", underline: true },
  linkUrl: { fg: "#88C0D0", underline: true },
  code: { fg: "#A3BE8C" },
  codeBlock: { fg: "#A3BE8C" },
  codeBlockBorder: { fg: "#4C566A" },
  quote: { fg: "#D08770", italic: true },
  quoteBorder: { fg: "#4C566A" },
  hr: { fg: "#4C566A" },
  listBullet: { fg: "#B48EAD" },
  bold: { bold: true },
  italic: { italic: true },
  strikethrough: { strikethrough: true },
  underline: { underline: true },
};

const words = Array.from({ length: 2000 }, (_, i) => `w${i}`);
const full = `# Stream\n\n${words.join(" ")}\n\n## Tail\n\nend.`;
const hz = 30;
const seconds = 20;
const ticks = hz * seconds;
const step = Math.max(1, Math.floor(full.length / ticks));
const metricsPath = process.env.PIT_MD_STREAM_METRICS ?? "/tmp/pit-md-stream-metrics.txt";

process.stderr.write(`pit markdown stream demo starting words=2000 hz=${hz} s=${seconds}\n`);
const tui = await TUI.create();
const md = new Markdown(tui.renderer, "", 1, 1, theme);
md.setStreaming(true);
tui.addChild(md);
const cpu0 = process.cpuUsage();
const t0 = Date.now();
let i = 0;
let hits = 0;

const timer = setInterval(() => {
  i += 1;
  const end = Math.min(full.length, i * step);
  md.setText(full.slice(0, end));
  if (md.lastStreamCacheHit()) hits += 1;
  tui.requestRender();
  if (i >= ticks || end >= full.length) {
    clearInterval(timer);
    md.setStreaming(false);
    const cpu = process.cpuUsage(cpu0);
    const wallMs = Date.now() - t0;
    const userMs = cpu.user / 1000;
    const sysMs = cpu.system / 1000;
    const line = `wallMs=${wallMs} userMs=${userMs.toFixed(1)} sysMs=${sysMs.toFixed(1)} cacheHits=${hits}/${i} cpuRatio=${((userMs + sysMs) / wallMs).toFixed(3)}`;
    writeFileSync(metricsPath, line + "\n");
    process.stderr.write(`pit markdown stream demo done ${line}\n`);
    tui.stop();
  }
}, 1000 / hz);
