import { installRelease } from "../adapters/update/install.ts";
import { fetchReleases, type FetchReleasesOptions } from "../adapters/update/releases.ts";
import type { UpgradeArgs } from "../args.ts";
import { availableUpdate, parseVersion, pickLatest, type ReleaseSummary, type UpdateChannel } from "../domain/update/index.ts";
import { channel as bakedChannel, version as bakedVersion } from "../domain/release-info.ts";

interface UpgradeDependencies {
  currentChannel?: UpdateChannel;
  currentVersion?: string;
  fetchReleases?(options: FetchReleasesOptions): Promise<ReleaseSummary[] | null>;
  install?(tag: string, channel: UpdateChannel): Promise<void>;
  write?(message: string): void;
  writeError?(message: string): void;
}

const targetTag = (version: string, channel: Exclude<UpdateChannel, "dev">): string => {
  const parsed = parseVersion(version);
  if (parsed?.channel !== channel) throw new Error(`invalid ${channel} version: ${version}`);
  return `v${version.replace(/^v/, "")}`;
};

export const runUpgrade = async (args: UpgradeArgs, deps: UpgradeDependencies = {}): Promise<number> => {
  const currentChannel = deps.currentChannel ?? bakedChannel as UpdateChannel;
  const currentVersion = deps.currentVersion ?? bakedVersion;
  const write = deps.write ?? ((message) => console.log(message));
  if (currentChannel === "dev") {
    (deps.writeError ?? ((message) => console.error(message)))("pit is running from source; use git pull");
    return 1;
  }
  const requestedChannel = args.channel ?? currentChannel;
  let tag: string | null;
  if (args.version) tag = targetTag(args.version, requestedChannel);
  else {
    const releases = await (deps.fetchReleases ?? fetchReleases)({ force: true });
    if (!releases) throw new Error("unable to check for pit updates");
    tag = pickLatest(requestedChannel, releases);
    if (!tag) throw new Error(`no ${requestedChannel} release found`);
  }
  // An explicit --version is a pin: install exactly that release (downgrades allowed);
  // only short-circuit when it is literally the running version.
  const upToDate = args.version
    ? tag === `v${currentVersion.replace(/^v/, "")}`
    : requestedChannel === currentChannel && !availableUpdate(currentVersion, currentChannel, [{ tag, prerelease: requestedChannel === "nightly" }]);
  if (upToDate) {
    write(`pit v${currentVersion} is already up to date`);
    return 0;
  }
  await (deps.install ?? installRelease)(tag, requestedChannel);
  write(`pit v${currentVersion} → ${tag}`);
  return 0;
};
