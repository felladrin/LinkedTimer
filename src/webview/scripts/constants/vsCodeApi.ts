import { isRunningInVsCodeWebview } from "./booleans";

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

export const vsCodeApi = isRunningInVsCodeWebview ? acquireVsCodeApi() : polyfillAcquireVsCodeApi();
