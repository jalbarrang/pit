import { getAgentDir, hasTrustRequiringProjectResources, ProjectTrustStore } from "@earendil-works/pi-coding-agent";

export class TrustStore {
  private readonly store: ProjectTrustStore;
  private readonly cwd: string;
  constructor(cwd = process.cwd(), agentDir = getAgentDir(), store = new ProjectTrustStore(agentDir)) {
    this.cwd = cwd; this.store = store;
  }
  needsPrompt(): boolean { return hasTrustRequiringProjectResources(this.cwd) && this.store.get(this.cwd) === null; }
  isTrusted(): boolean { return this.store.get(this.cwd) === true; }
  setTrusted(trusted: boolean): void { this.store.set(this.cwd, trusted); }
}
