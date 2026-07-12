export interface UpgradeArgs {
  channel?: "stable" | "nightly";
  version?: string;
}

export interface MainArgs {
  cwd: string;
  resume: boolean;
  version: boolean;
  upgrade?: UpgradeArgs;
}

const upgradeUsage = "usage: pit upgrade [--channel stable|nightly] [--version X.Y.Z]";

const parseUpgrade = (argv: string[]): UpgradeArgs => {
  const upgrade: UpgradeArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const value = argv[i + 1];
    if (argv[i] === "--channel") {
      if (value !== "stable" && value !== "nightly") throw new Error(upgradeUsage);
      upgrade.channel = value;
      i++;
    } else if (argv[i] === "--version" && value) {
      upgrade.version = value;
      i++;
    } else throw new Error(upgradeUsage);
  }
  return upgrade;
};

export const parseArgs = (argv: string[], fallbackCwd = process.cwd()): MainArgs => {
  if (argv[0] === "upgrade") return { cwd: fallbackCwd, resume: false, version: false, upgrade: parseUpgrade(argv.slice(1)) };
  let cwd = fallbackCwd;
  let resume = false;
  let version = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--cwd" && argv[i + 1]) cwd = argv[++i];
    else if (argv[i] === "--resume") resume = true;
    else if (argv[i] === "--version") version = true;
    else if (argv[i] === "--help") throw new Error("usage: pit [--cwd PATH] [--resume] [--version] | pit upgrade [options]");
  }
  return { cwd, resume, version };
};
