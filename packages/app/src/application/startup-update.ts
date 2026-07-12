import { fetchReleases, type FetchReleasesOptions } from "../adapters/update/releases.ts";
import { availableUpdate, type ReleaseSummary, type UpdateChannel } from "../domain/update/index.ts";
import { channel as bakedChannel, version as bakedVersion } from "../domain/release-info.ts";

interface StartupUpdateDependencies {
  currentChannel?: UpdateChannel;
  currentVersion?: string;
  fetchReleases?(options?: FetchReleasesOptions): Promise<ReleaseSummary[] | null>;
  defer?(callback: () => void): void;
}

const afterFirstFrame = (callback: () => void): void => {
  const timer = setTimeout(callback, 100);
  timer.unref();
};

export const scheduleStartupUpdateCheck = (
  notify: (message: string) => void,
  deps: StartupUpdateDependencies = {},
): void => {
  const currentChannel = deps.currentChannel ?? bakedChannel as UpdateChannel;
  if (currentChannel === "dev") return;
  const currentVersion = deps.currentVersion ?? bakedVersion;
  (deps.defer ?? afterFirstFrame)(() => {
    void (async () => {
      try {
        const releases = await (deps.fetchReleases ?? fetchReleases)();
        if (!releases) return;
        const tag = availableUpdate(currentVersion, currentChannel, releases);
        if (tag) notify(`pit v${tag.replace(/^v/, "")} available — run pit upgrade`);
      } catch { /* startup checks are always silent */ }
    })();
  });
};
