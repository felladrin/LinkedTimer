import { appName } from "./appController";
import { listenToTimerTargetAchieved, listenToTimerValuesString } from "./timerController";

declare const acquireVsCodeApi: () => {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
};

const polyfillAcquireVsCodeApi: typeof acquireVsCodeApi = () => {
  const voidFunction = () => undefined;
  return {
    postMessage: voidFunction,
    getState: voidFunction,
    setState: voidFunction,
  };
};

export const isRunningInVsCodeWebview = "acquireVsCodeApi" in window;

export const vsCodeApi = isRunningInVsCodeWebview ? acquireVsCodeApi() : polyfillAcquireVsCodeApi();

export const vsCodeMarketplaceUrl = "https://marketplace.visualstudio.com/items?itemName=felladrin.linked-timer";

listenToTimerTargetAchieved(() => {
  vsCodeApi.postMessage({ informationMessage: `${appName}: Time's up!` });
});

listenToTimerTargetAchieved(() => {
  const title = `Time's up! | ${appName}`;
  vsCodeApi.postMessage({ panelTitle: title });
});

listenToTimerValuesString((timerValuesString) => {
  vsCodeApi.postMessage({ panelTitle: timerValuesString });
});
