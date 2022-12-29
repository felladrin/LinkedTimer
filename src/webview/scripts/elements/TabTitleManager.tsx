import { useDocumentTitle } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { vsCodeApi } from "../controllers/vsCodeController";
import { appName } from "../controllers/appController";
import { listenToTimerTargetAchieved, timerValuesStringPubSub } from "../controllers/timerController";
import { usePubSub } from "create-pubsub/react";

export function TabTitleManager() {
  const [timerValuesString] = usePubSub(timerValuesStringPubSub);
  const [title, setTitle] = useState(document.title);
  useDocumentTitle(title);

  useEffect(() => {
    vsCodeApi.postMessage({ panelTitle: timerValuesString });
    setTitle(`${timerValuesString} | ${appName}`);
  }, [timerValuesString]);

  useEffect(() => {
    const unsubscribe = listenToTimerTargetAchieved(() => {
      const title = `Time's up! | ${appName}`;
      vsCodeApi.postMessage({ panelTitle: title });
      setTitle(title);
    });

    return unsubscribe;
  }, []);

  return <></>;
}
