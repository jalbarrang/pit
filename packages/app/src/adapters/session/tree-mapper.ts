import { textFromContent } from "../../domain/conversation/event-text.ts";
import type { TreeNode } from "../../domain/tree/types.ts";

type SdkNode = {
  entry?: {
    id?: string;
    parentId?: string | null;
    timestamp?: string;
    type?: string;
    message?: { role?: string; content?: unknown };
    content?: unknown;
  };
  children?: unknown[];
  label?: string;
};

const kindOf = (entry: SdkNode["entry"]): TreeNode["kind"] => {
  if (entry?.type === "message") {
    const role = entry.message?.role;
    if (role === "user") return "user";
    if (role === "assistant") return "assistant";
    if (role === "toolResult") return "tool";
  }
  return "other";
};

const excerpt = (content: unknown): string => {
  const line = textFromContent(content as never).replace(/\s+/g, " ").trim();
  return line.length > 80 ? line.slice(0, 80) : line;
};

const mapNode = (raw: unknown): TreeNode => {
  const node = (raw ?? {}) as SdkNode;
  const entry = node.entry ?? {};
  const content = entry.type === "message" ? entry.message?.content : undefined;
  const parentId = entry.parentId ?? undefined;
  return {
    id: entry.id ?? "",
    ...(parentId ? { parentId } : {}),
    ...(node.label !== undefined ? { label: node.label } : {}),
    ...(entry.timestamp ? { timestamp: Date.parse(entry.timestamp) } : {}),
    kind: kindOf(entry),
    text: excerpt(content),
    children: (node.children ?? []).map(mapNode),
  };
};

export const mapTree = (sdkNodes: unknown[]): TreeNode[] => sdkNodes.map(mapNode);
