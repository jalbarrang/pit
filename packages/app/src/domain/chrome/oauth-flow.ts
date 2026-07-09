export type OAuthFlowState =
  | { kind: "idle" }
  | { kind: "browser"; url: string; instructions?: string }
  | { kind: "device"; uri: string; code: string }
  | { kind: "waiting"; message: string }
  | { kind: "done"; ok: boolean; message: string };

export type OAuthFlowEvent =
  | { type: "auth-url"; url: string; instructions?: string }
  | { type: "device-code"; uri: string; code: string }
  | { type: "waiting"; message: string }
  | { type: "success" }
  | { type: "cancel"; message?: string };

export const nextOAuthFlowState = (_state: OAuthFlowState, event: OAuthFlowEvent): OAuthFlowState => {
  if (event.type === "auth-url") return { kind: "browser", url: event.url, instructions: event.instructions };
  if (event.type === "device-code") return { kind: "device", uri: event.uri, code: event.code };
  if (event.type === "waiting") return { kind: "waiting", message: event.message };
  if (event.type === "success") return { kind: "done", ok: true, message: "Login complete" };
  return { kind: "done", ok: false, message: event.message ?? "Login cancelled" };
};
