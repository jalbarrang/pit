export interface MainArgs {
  cwd: string;
  resume: boolean;
}

export const parseArgs = (argv: string[], fallbackCwd = process.cwd()): MainArgs => {
  let cwd = fallbackCwd;
  let resume = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--cwd" && argv[i + 1]) cwd = argv[++i];
    else if (argv[i] === "--resume") resume = true;
    else if (argv[i] === "--help") throw new Error("usage: pit [--cwd PATH] [--resume]");
  }
  return { cwd, resume };
};
