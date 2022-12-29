import { TabTitleManager } from "../elements/TabTitleManager";

export const isRunningInDevEnvironment = process.env.NODE_ENV === "development";

export const isRunningInBrowser = !("acquireVsCodeApi" in window);

export const appName = "Linked Timer";

export const features = [
  { name: TabTitleManager.name, defaultValue: true },
] as import("react-enable/dist/FeatureState").FeatureDescription[];
