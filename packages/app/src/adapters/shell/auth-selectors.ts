import type { RenderContext } from "@opentui/core";
import type { TUI } from "@pit/tui";
import { InputOverlay } from "../../components/chrome/input-overlay.ts";
import { SelectorOverlay, type SelectorOverlayOptions } from "../../components/chrome/selector-overlay.ts";
import { authProviderItems, findAuthProvider } from "../../domain/chrome/index.ts";
import type { AuthStore } from "../auth/index.ts";

export interface AuthSelectorHost {
  tui(): TUI;
  auth(): AuthStore | undefined;
  notify(text: string): void;
  onAuthConfigured?(): Promise<void>;
}

type SelectFactory = (ctx: RenderContext, options: SelectorOverlayOptions) => SelectorOverlay;
type InputFactory = (ctx: RenderContext, title: string, masked: boolean) => InputOverlay;
const selectFactory: SelectFactory = (ctx, options) => new SelectorOverlay(ctx, options);
const inputFactory: InputFactory = (ctx, title, masked) => new InputOverlay(ctx, title, masked);

export class AuthSelectors {
  private readonly host: AuthSelectorHost;
  private readonly makeSelect: SelectFactory;
  private readonly makeInput: InputFactory;
  constructor(host: AuthSelectorHost, makeSelect = selectFactory, makeInput = inputFactory) {
    this.host = host; this.makeSelect = makeSelect; this.makeInput = makeInput;
  }

  openLogin(): void {
    const auth = this.host.auth();
    const providers = auth?.providers() ?? [];
    if (!auth || providers.length === 0) return this.host.notify("No auth providers available.");
    const overlay = this.makeSelect(this.host.tui().ctx, { items: authProviderItems(providers), searchable: true });
    const handle = this.host.tui().showOverlay(overlay as never, { width: width(this.host.tui()), anchor: "center" });
    overlay.setWidth(width(this.host.tui()));
    overlay.onCancel = () => handle.hide();
    overlay.onSelect = (item) => {
      handle.hide();
      const provider = findAuthProvider(providers, item.value);
      if (provider?.authType === "oauth") void this.loginOAuth(provider.id);
      else if (provider) this.openApiKey(provider.id, provider.name);
    };
  }

  private openApiKey(provider: string, name: string): void {
    const overlay = this.makeInput(this.host.tui().ctx, `API key for ${name}`, true);
    const handle = this.host.tui().showOverlay(overlay as never, { width: width(this.host.tui()), anchor: "center" });
    overlay.setWidth(width(this.host.tui()));
    overlay.onCancel = () => handle.hide();
    overlay.onSubmit = (key) => { handle.hide(); void this.saveApiKey(provider, key); };
  }

  private async saveApiKey(provider: string, key: string): Promise<void> {
    await this.host.auth()?.setApiKey(provider, key.trim());
    this.host.notify(`Login saved for ${provider}`);
    await this.host.onAuthConfigured?.();
  }

  private async loginOAuth(provider: string): Promise<void> {
    this.host.notify(`OAuth login for ${provider} needs human TTY verification.`);
  }
}

const width = (tui: TUI): number => Math.min(Math.max(40, (tui.renderer?.width ?? 80) - 8), 100);
