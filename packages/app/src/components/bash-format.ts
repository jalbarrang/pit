export const formatBashHeader = (command: string, excluded: boolean): string =>
  excluded ? `$ ${command}  (excluded)` : `$ ${command}`;

export const formatBashOutput = (output: string, expanded: boolean, lines = 20): string => {
  if (expanded) return output;
  const parts = output.trimEnd().split("\n");
  const tail = parts.slice(-lines).join("\n");
  return parts.length > lines ? `… ${parts.length - lines} more lines\n${tail}` : tail;
};

export const formatBashStatus = (exitCode: number | null | undefined, cancelled: boolean): string => {
  if (cancelled) return "cancelled";
  if (typeof exitCode === "number" && exitCode !== 0) return `exit ${exitCode}`;
  return "";
};
