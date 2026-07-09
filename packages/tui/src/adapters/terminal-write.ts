export type TerminalWrite = (data: string) => void;

export const terminalWrite: TerminalWrite = (data) => {
  process.stdout.write(data);
};
