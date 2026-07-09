export interface ExternalEditorDeps {
  argv: string[];
  text: string;
  tmpPath: string;
  writeFile(path: string, data: string): void;
  readFile(path: string): string;
  removeFile(path: string): void;
  spawn(cmd: string, args: string[]): void;
  suspend(): void;
  resume(): void;
  setText(text: string): void;
}

export function openInExternalEditor(deps: ExternalEditorDeps): void {
  deps.writeFile(deps.tmpPath, deps.text);
  deps.suspend();
  try { deps.spawn(deps.argv[0]!, [...deps.argv.slice(1), deps.tmpPath]); }
  finally { deps.resume(); }
  const edited = deps.readFile(deps.tmpPath);
  deps.setText(edited);
  deps.removeFile(deps.tmpPath);
}
