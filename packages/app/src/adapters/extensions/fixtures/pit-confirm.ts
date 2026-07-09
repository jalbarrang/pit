/**
 * Minimal dialog extension for pit live gate (mirrors timed-confirm confirm flow).
 * Kept in-repo so the gate does not depend on pi-mono checkout path at runtime.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.registerCommand("pit-confirm", {
    description: "Confirm dialog live gate",
    handler: async (_args, ctx) => {
      const confirmed = await ctx.ui.confirm("Pit gate", "Confirm this dialog?");
      ctx.ui.notify(confirmed ? "gate:yes" : "gate:no", "info");
    },
  });
}
