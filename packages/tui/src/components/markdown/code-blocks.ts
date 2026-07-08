import {
  CodeRenderable,
  createMarkdownCodeBlockRenderer,
  type MarkdownCodeBlockRenderer,
  type MarkdownOptions,
  type RenderContext,
} from "@opentui/core";
import { resolveCodeFenceFiletype } from "../../domain/styling/code-fence-lang.ts";

/** Optional Code override; known langs get CodeRenderable, unknown falls through to default. */
export function createCodeBlockRenderNode(ctx: RenderContext): NonNullable<MarkdownOptions["renderNode"]> {
  const render: MarkdownCodeBlockRenderer = (token, context) => {
    const filetype = resolveCodeFenceFiletype(token.lang);
    if (!filetype) return context.defaultRender();
    return new CodeRenderable(ctx, {
      content: token.text,
      filetype,
      syntaxStyle: context.syntaxStyle,
      conceal: context.concealCode,
      width: "100%",
      height: "auto",
      treeSitterClient: context.treeSitterClient,
    });
  };
  return createMarkdownCodeBlockRenderer({
    typescript: render,
    javascript: render,
    python: render,
    go: render,
    rust: render,
    bash: render,
    json: render,
    diff: render,
    typescriptreact: render,
    javascriptreact: render,
  })!;
}
