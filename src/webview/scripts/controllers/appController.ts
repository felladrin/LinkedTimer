export const isRunningInDevEnvironment = process.env.NODE_ENV === "development";

export const isRunningInBrowser = !("acquireVsCodeApi" in window);

export const appName = "Linked Timer";
