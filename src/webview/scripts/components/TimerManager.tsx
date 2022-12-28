import { useLocalStorage } from "@mantine/hooks";
import { useContext, useEffect } from "react";
import {
  startTimerButtonClickedPubSub,
  stopTimerButtonClickedPubSub,
  TimerContext,
  timerHoursLocalStorageProperties,
  timerMinutesLocalStorageProperties,
  timerSecondsLocalStorageProperties,
} from "../constants";

export function TimerManager() {
  const timer = useContext(TimerContext);
  const [timerHours] = useLocalStorage(timerHoursLocalStorageProperties);
  const [timerMinutes] = useLocalStorage(timerMinutesLocalStorageProperties);
  const [timerSeconds] = useLocalStorage(timerSecondsLocalStorageProperties);

  useEffect(() => {
    const [, subStartTimerButtonClicked] = startTimerButtonClickedPubSub;

    const unsubscribe = subStartTimerButtonClicked(() => {
      timer.start({
        startValues: {
          hours: timerHours,
          minutes: timerMinutes,
          seconds: timerSeconds,
        },
      });
    });

    return unsubscribe;
  }, [timerHours, timerMinutes, timerSeconds]);

  useEffect(() => {
    const [, subStopTimerButtonClicked] = stopTimerButtonClickedPubSub;

    const unsubscribe = subStopTimerButtonClicked(timer.stop);

    return unsubscribe;
  }, []);

  return <></>;
}
