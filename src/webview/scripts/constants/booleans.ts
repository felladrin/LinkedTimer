export const isRunningInVsCodeWebview = "acquireVsCodeApi" in window;
export const isRunningInBrowser = !isRunningInVsCodeWebview;
