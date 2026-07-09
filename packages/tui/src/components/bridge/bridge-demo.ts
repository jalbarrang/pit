/**
 * Demo: chalk-styled legacy component inside a fullscreen opentui root via AnsiBridge.
 * Run: scripts/dev.sh packages/tui/src/components/bridge/bridge-demo.ts
 */
import { createCliRenderer } from "@opentui/core";
import chalk from "chalk";
import { AnsiBridge } from "./ansi-bridge.ts";
import type { LegacyComponent } from "./legacy.ts";

chalk.level = 3;

const legacy: LegacyComponent = {
  render: (width) => [
    chalk.bold.cyan("AnsiBridge demo"),
    chalk.green("legacy render(width) → StyledText lines"),
    chalk.bgBlue.white(` width=${width} `),
    chalk.yellow("Ctrl+C to exit"),
  ],
};

const renderer = await createCliRenderer({ exitOnCtrlC: true });
const bridge = new AnsiBridge(renderer, legacy);
bridge.setWidth(renderer.width);
renderer.root.add(bridge.renderable);
renderer.on("resize", ({ width }) => bridge.setWidth(width));
