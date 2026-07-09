import type { SelectItem } from "@pit/tui";

export type AuthType = "api_key" | "oauth";
export interface AuthProvider { id: string; name: string; authType: AuthType; configured?: boolean }

export const authProviderItems = (providers: AuthProvider[]): SelectItem[] =>
  providers.map((provider) => ({
    value: provider.id,
    label: provider.name,
    description: `${provider.authType === "oauth" ? "OAuth" : "API key"}${provider.configured ? " · configured" : ""}`,
  }));

export const findAuthProvider = (providers: AuthProvider[], id: string): AuthProvider | undefined =>
  providers.find((provider) => provider.id === id);
