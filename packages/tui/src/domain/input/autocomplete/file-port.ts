export interface FileSearchEntry { path: string; isDirectory: boolean }
export interface FileSearchOptions { recursive: boolean; signal?: AbortSignal }
export interface FileSearchPort {
  search(rawPrefix: string, basePath: string, options: FileSearchOptions): Promise<FileSearchEntry[]> | FileSearchEntry[];
}
