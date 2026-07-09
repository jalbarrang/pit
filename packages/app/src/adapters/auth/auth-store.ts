import { AuthStorage, ModelRegistry } from "@earendil-works/pi-coding-agent";
type OAuthLoginCallbacks = Parameters<AuthStorage["login"]>[1];
import type { AuthProvider } from "../../domain/chrome/index.ts";

export class AuthStore {
  readonly storage: AuthStorage;
  private readonly registry: ModelRegistry;
  constructor(authPath?: string, storage = AuthStorage.create(authPath)) {
    this.storage = storage;
    this.registry = ModelRegistry.create(storage);
  }

  hasCredentials(): boolean { return this.registry.getAvailable().length > 0; }

  providers(): AuthProvider[] {
    const ids = new Set(this.registry.getAll().map((model) => model.provider));
    const api = [...ids].sort().map((id) => ({ id, name: this.registry.getProviderDisplayName(id), authType: "api_key" as const, configured: this.storage.hasAuth(id) }));
    const oauth = this.storage.getOAuthProviders().map((provider) => ({ id: provider.id, name: provider.name, authType: "oauth" as const, configured: this.storage.hasAuth(provider.id) }));
    return [...oauth, ...api].filter((provider, index, all) => all.findIndex((item) => item.id === provider.id) === index);
  }

  async setApiKey(provider: string, key: string): Promise<void> {
    this.storage.set(provider, { type: "api_key", key });
    this.registry.refresh();
  }

  async loginOAuth(provider: string, callbacks: OAuthLoginCallbacks): Promise<void> {
    await this.storage.login(provider as never, callbacks);
    this.registry.refresh();
  }
}
