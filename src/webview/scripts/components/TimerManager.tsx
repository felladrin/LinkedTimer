import { usePubSub } from "create-pubsub/react";
import { useEffect } from "react";
import {
  startTimerButtonClickedPubSub,
  stopTimerButtonClickedPubSub,
  timer,
  timerHoursPubSub,
  timerMinutesPubSub,
  timerSecondsPubSub
} from "../constants";

export function TimerManager() {
  const [timerHours] = usePubSub(timerHoursPubSub);
  const [timerMinutes] = usePubSub(timerMinutesPubSub);
  const [timerSeconds] = usePubSub(timerSecondsPubSub);

  useEffect(() => {
    const [, subStartTimerButtonClicked] = startTimerButtonClickedPubSub;

    const unsubscribe = subStartTimerButtonClicked(() => {
      timer.start({
        startValues: {
          hours: Number(timerHours),
          minutes: Number(timerMinutes),
          seconds: Number(timerSeconds)
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [timerHours, timerMinutes, timerSeconds]);

  useEffect(() => {
    const [, subStopTimerButtonClicked] = stopTimerButtonClickedPubSub;

    const unsubscribe = subStopTimerButtonClicked(timer.stop);

    return () => {
      unsubscribe();
    };
  }, []);

  return <></>;
}
