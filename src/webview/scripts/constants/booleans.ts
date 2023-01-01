export const isRunningInDevEnvironment = process.env.NODE_ENV === "development";
export const isRunningInVsCodeWebview = "acquireVsCodeApi" in window;
export const isRunningInBrowser = !isRunningInVsCodeWebview;
