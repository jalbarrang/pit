export interface TreeNode {
  id: string;
  parentId?: string;
  label?: string;
  timestamp?: number;
  kind: "user" | "assistant" | "tool" | "other";
  text: string;
  children: TreeNode[];
}
