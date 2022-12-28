import { createPubSub } from "create-pubsub";
import type Peer from "peerjs";
import { DataConnection } from "peerjs";
import Timer from "easytimer.js";
import { TabTitleManager } from "./components/TabTitleManager";
import { NotificationManager } from "./components/NotificationManager";
import { IStorageProperties } from "@mantine/hooks/lib/use-local-storage/create-storage";
import { createContext } from "react";

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
export const isRunningInBrowser = !isRunningInVsCodeWebview;
export const vsCodeApi = isRunningInVsCodeWebview ? acquireVsCodeApi() : polyfillAcquireVsCodeApi();
export const extensionName = "Linked Timer";
export const vsCodeMarketplaceUrl = "https://marketplace.visualstudio.com/items?itemName=felladrin.linked-timer";
export const features = [
  { name: TabTitleManager.name, defaultValue: true },
  { name: NotificationManager.name, defaultValue: true },
] as import("react-enable/dist/FeatureState").FeatureDescription[];
export const TimerContext = createContext<Timer>(null!);
export type PeerState = [
  peer: Peer,
  isPeerOpen: boolean,
  peerConnections: DataConnection[],
  connectToPeer: (requestedPeerIdToConnect: string) => void
];
export const PeerContext = createContext<PeerState>(null!);
export const requestedPeerIdToConnectPubSub = createPubSub("");
export const startTimerButtonClickedPubSub = createPubSub();
export const stopTimerButtonClickedPubSub = createPubSub();
export const timerHoursLocalStorageProperties: IStorageProperties<number> = {
  key: "linked-timer-hours",
  defaultValue: 0,
};
export const timerMinutesLocalStorageProperties: IStorageProperties<number> = {
  key: "linked-timer-minutes",
  defaultValue: 0,
};
export const timerSecondsLocalStorageProperties: IStorageProperties<number> = {
  key: "linked-timer-seconds",
  defaultValue: 15,
};
export const connectionsPubSub = createPubSub<DataConnection[]>([]);
