import { createPubSub } from "create-pubsub";
import Peer from "peerjs";
import { CurrentScreen } from "./enumerations";
import Timer from "easytimer.js";
import { TabTitleManager } from "./components/Root/TabTitleManager/TabTitleManager";
import { NotificationManager } from "./components/Root/NotificationManager/NotificationManager";
import { LocalStorageManager } from "./components/Root/LocalStorageManager/LocalStorageManager";
import { v4 as uuidv4 } from "uuid";

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
    setState: voidFunction,
  };
};
export const isRunningInDevEnvironment = process.env.NODE_ENV === "development";
export const isRunningInVsCodeWebview = "acquireVsCodeApi" in window;
export const vsCodeApi = isRunningInVsCodeWebview ? acquireVsCodeApi() : polyfillAcquireVsCodeApi();
export const extensionName = "Linked Timer";
export const vsCodeMarketplaceUrl = "https://marketplace.visualstudio.com/items?itemName=felladrin.linked-timer";
export const features = [
  { name: TabTitleManager.name, defaultValue: true },
  { name: NotificationManager.name, defaultValue: true },
  { name: LocalStorageManager.name, defaultValue: "localStorage" in window, noOverride: true },
] as import("react-enable/dist/FeatureState").FeatureDescription[];
export const timer = new Timer({
  countdown: true,
  startValues: { hours: 0, minutes: 1, seconds: 0 },
});
export const peerIdPrefix = "linked-timer-";
export const peer = new Peer(
  `${peerIdPrefix}${uuidv4()}`,
  isRunningInDevEnvironment
    ? {
        host: location.hostname,
        port: 9000,
        debug: 2,
      }
    : undefined
);
export const hostTimerIdPubSub = createPubSub("");
export const timerIdToJoinPubSub = createPubSub("");
export const startTimerButtonClickedPubSub = createPubSub();
export const stopTimerButtonClickedPubSub = createPubSub();
export const timerHoursPubSub = createPubSub("00");
export const timerMinutesPubSub = createPubSub("01");
export const timerSecondsPubSub = createPubSub("00");
export const currentScreenPubSub = createPubSub(CurrentScreen.InitialScreen);
