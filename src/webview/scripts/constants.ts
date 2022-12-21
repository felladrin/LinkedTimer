import { createPubSub } from "create-pubsub";
import type Peer from "peerjs";
import { DataConnection } from "peerjs";
import Timer from "easytimer.js";
import { TabTitleManager } from "./components/TabTitleManager";
import { NotificationManager } from "./components/NotificationManager";
import { LocalStorageManager } from "./components/LocalStorageManager";

declare const acquireVsCodeApi: () => {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
};

const polyfillAcquireVsCodeApi: typeof acquireVsCodeApi = () => {
  const voidFunction = () => {};
  return {
    postMessage: voidFunction,
    getState: voidFunction,
    setState: voidFunction
  };
};
export const isRunningInDevEnvironment = process.env.NODE_ENV === "development";
export const isRunningInVsCodeWebview = "acquireVsCodeApi" in window;
export const isRunningInBrowser = !isRunningInVsCodeWebview;
export const vsCodeApi = isRunningInVsCodeWebview ? acquireVsCodeApi() : polyfillAcquireVsCodeApi();
export const extensionName = "Linked Timer";
export const vsCodeMarketplaceUrl = "https://marketplace.visualstudio.com/items?itemName=felladrin.linked-timer";
export const features = [
  { name: TabTitleManager.name, defaultValue: true },
  { name: NotificationManager.name, defaultValue: true },
  { name: LocalStorageManager.name, defaultValue: "localStorage" in window, noOverride: true }
] as import("react-enable/dist/FeatureState").FeatureDescription[];
export const timer = new Timer({
  countdown: true,
  startValues: { hours: 0, minutes: 0, seconds: 15 }
});
export const requestedPeerIdToConnectPubSub = createPubSub("");
export const startTimerButtonClickedPubSub = createPubSub();
export const stopTimerButtonClickedPubSub = createPubSub();
export const timerHoursPubSub = createPubSub("00");
export const timerMinutesPubSub = createPubSub("00");
export const timerSecondsPubSub = createPubSub("15");
export const peerPubSub = createPubSub<Peer | null>(null);
export const connectionsPubSub = createPubSub<DataConnection[]>([]);
