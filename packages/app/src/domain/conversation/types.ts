export type TurnRole = "user" | "assistant";
export type StreamingState = "idle" | "awaiting" | "streaming" | "complete" | "aborted";

export interface Turn {
  id: string;
  role: TurnRole;
  text: string;
  thinking?: string;
  streaming: StreamingState;
}

export interface ToolRun {
  id: string;
  name: string;
  args: unknown;
  status: "running" | "succeeded" | "failed";
  output: string;
  images?: import("../images/index.ts").ImagePart[];
}

export interface TranscriptSnapshot {
  turns: Turn[];
  tools: ToolRun[];
}
