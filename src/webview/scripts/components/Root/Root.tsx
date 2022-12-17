import { Enable, Features, ToggleFeatures } from "react-enable";
import { extensionName, features, isRunningInDevEnvironment } from "../../constants";
import { StickyAlertsContainer } from "./StickyAlertsContainer/StickyAlertsContainer";
import { TabTitleManager } from "./TabTitleManager/TabTitleManager";
import { NotificationManager } from "./NotificationManager/NotificationManager";
import { LocalStorageManager } from "./LocalStorageManager/LocalStorageManager";
import { CurrentScreenPresenter } from "./CurrentScreenPresenter/CurrentScreenPresenter";
import halfmoon from "halfmoon";

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
      <div className="d-flex justify-content-center">
        <div className="card w-450 p-0">
          <div className="px-card py-10 border-bottom">
            <h2 className="card-title font-size-18 m-0  text-center">{extensionName}</h2>
          </div>
          <CurrentScreenPresenter />
          <div className="px-card py-10 bg-light-lm bg-very-dark-dm rounded-bottom d-flex justify-content-center">
            <button className="btn btn-link btn-sm text-muted" type="button" onClick={() => halfmoon.toggleDarkMode()}>
              Toggle Dark Mode
            </button>
          </div>
        </div>
      </div>

      {isRunningInDevEnvironment ? <ToggleFeatures /> : <></>}
    </Features>
  );
}
