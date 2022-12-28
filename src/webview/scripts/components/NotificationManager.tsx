import { useContext, useEffect } from "react";
import { extensionName, TimerContext, vsCodeApi } from "../constants";

export function NotificationManager() {
  const timer = useContext(TimerContext);

  useEffect(() => {
    const targetAchievedListener = () => {
      vsCodeApi.postMessage({ informationMessage: `${extensionName}: Time's up!` });
    };

    timer.on("targetAchieved", targetAchievedListener);

    return () => {
      timer.off("targetAchieved", targetAchievedListener);
    };
  }, []);
  return <></>;
}
