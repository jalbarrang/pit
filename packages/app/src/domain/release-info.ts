declare const PIT_VERSION: string;
declare const PIT_CHANNEL: string;

export const version = typeof PIT_VERSION !== "undefined" ? PIT_VERSION : "0.0.0-dev";
export const channel = typeof PIT_CHANNEL !== "undefined" ? PIT_CHANNEL : "dev";
