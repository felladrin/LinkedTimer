import { useDocumentTitle } from "@mantine/hooks";
import { useContext, useEffect, useState } from "react";
import { extensionName, TimerContext, vsCodeApi } from "../constants";

export function TabTitleManager() {
  const timer = useContext(TimerContext);
  const [initialTitle] = useState(document.title);
  const [title, setTitle] = useState(initialTitle);
  useDocumentTitle(title);

  useEffect(() => {
    const setTitleWithCurrentTime = () => {
      const timerValuesAsString = timer.getTimeValues().toString();
      vsCodeApi.postMessage({ panelTitle: timerValuesAsString });
      setTitle(`${timerValuesAsString} | ${extensionName}`);
    };

    const handleTargetAchieved = () => {
      const title = `Time's up! | ${extensionName}`;
      vsCodeApi.postMessage({ panelTitle: title });
      setTitle(title);
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

      setTitle(initialTitle);
    };
  }, []);
  return <></>;
}
