import { Markdown, TUI, type MarkdownTheme } from "../src/index.ts";

const theme: MarkdownTheme = {
  heading: { fg: "#88C0D0", bold: true },
  link: { fg: "#81A1C1", underline: true },
  linkUrl: { fg: "#88C0D0", underline: true },
  code: { fg: "#A3BE8C" },
  codeBlock: { fg: "#A3BE8C" },
  codeBlockBorder: { fg: "#4C566A" },
  quote: { fg: "#D08770", italic: true },
  quoteBorder: { fg: "#4C566A" },
  hr: { fg: "#4C566A" },
  listBullet: { fg: "#B48EAD" },
  bold: { bold: true },
  italic: { italic: true },
  strikethrough: { strikethrough: true },
  underline: { underline: true },
};

const doc = `# Markdown demo

Heading, **bold**, *italic*, and \`inline code\`.

- list one
- list two

> a quote

\`\`\`ts
const greet = (name: string) => \`hi \${name}\`
\`\`\`

\`\`\`py
def greet(name):
    return f"hi {name}"
\`\`\`

\`\`\`unknownlang
plain fence
\`\`\`

[docs](https://opentui.dev)
`;

console.log("pit markdown demo starting");
const tui = await TUI.create();
const md = new Markdown(tui.renderer, doc, 1, 1, theme);
tui.addChild(md);
tui.requestRender();
setTimeout(() => {
  tui.stop();
  console.log("pit markdown demo stopped");
}, 1500);
