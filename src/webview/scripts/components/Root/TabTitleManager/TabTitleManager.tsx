import { useEffect } from "react";
import { extensionName, timer, vsCodeApi } from "../../../constants";

export function TabTitleManager() {
  useEffect(() => {
    const initialTitle = document.title;

    const setTitleWithCurrentTime = () => {
      const timerValuesAsString = timer.getTimeValues().toString();
      vsCodeApi.postMessage({ panelTitle: timerValuesAsString });
      document.title = `${timerValuesAsString} | ${extensionName}`;
    };

    const handleTargetAchieved = () => {
      const title = `Time's up! | ${extensionName}`;
      vsCodeApi.postMessage({ panelTitle: title });
      document.title = title;
    };

    timer.on("started", setTitleWithCurrentTime);
    timer.on("stopped", setTitleWithCurrentTime);
    timer.on("secondsUpdated", setTitleWithCurrentTime);
    timer.on("targetAchieved", handleTargetAchieved);

    return () => {
      timer.off("started", setTitleWithCurrentTime);
      timer.off("stopped", setTitleWithCurrentTime);
      timer.off("secondsUpdated", setTitleWithCurrentTime);
      timer.off("targetAchieved", handleTargetAchieved);

      document.title = initialTitle;
    };
  }, []);
  return <></>;
}