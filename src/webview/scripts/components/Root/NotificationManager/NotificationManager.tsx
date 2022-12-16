import { useEffect } from "react";
import { extensionName, timer, vsCodeApi } from "../../../constants";

export function NotificationManager() {
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