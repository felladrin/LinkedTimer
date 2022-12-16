import { Enable, Features, ToggleFeatures } from "react-enable";
import { features, isRunningInDevEnvironment } from "../../constants";
import { StickyAlertsContainer } from "./StickyAlertsContainer/StickyAlertsContainer";
import { TabTitleManager } from "./TabTitleManager/TabTitleManager";
import { NotificationManager } from "./NotificationManager/NotificationManager";
import { LocalStorageManager } from "./LocalStorageManager/LocalStorageManager";
import { CurrentScreenPresenter } from "./CurrentScreenPresenter/CurrentScreenPresenter";

export function Root() {
  return (
    <Features features={features}>
      <StickyAlertsContainer />
      <Enable feature={TabTitleManager.name}>
        <TabTitleManager />
      </Enable>
      <Enable feature={NotificationManager.name}>
        <NotificationManager />
      </Enable>
      <Enable feature={LocalStorageManager.name}>
        <LocalStorageManager />
      </Enable>
      <CurrentScreenPresenter />
      {isRunningInDevEnvironment ? <ToggleFeatures /> : <></>}
    </Features>
  );
}