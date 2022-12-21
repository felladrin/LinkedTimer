import { useEffect } from "react";
import { timerHoursPubSub, timerMinutesPubSub, timerSecondsPubSub } from "../constants";

export function LocalStorageManager() {
  useEffect(() => {
    const [setTimerHours, onTimerHoursChanged, getTimerHours] = timerHoursPubSub;
    const [setTimerMinutes, onTimerMinutesChanged, getTimerMinutes] = timerMinutesPubSub;
    const [setTimerSeconds, onTimerSecondsChanged, getTimerSeconds] = timerSecondsPubSub;

    setTimerHours(window.localStorage.getItem("linked_timer_hours") ?? getTimerHours());
    setTimerMinutes(window.localStorage.getItem("linked_timer_minutes") ?? getTimerMinutes());
    setTimerSeconds(window.localStorage.getItem("linked_timer_seconds") ?? getTimerSeconds());

    const unsubscribeFromTimerHoursChanged = onTimerHoursChanged((hours) => {
      window.localStorage.setItem("linked_timer_hours", hours);
    });

    const unsubscribeFromTimerMinuteChanged = onTimerMinutesChanged((minutes) => {
      window.localStorage.setItem("linked_timer_minutes", minutes);
    });

    const unsubscribeFromTimerSecondsChanged = onTimerSecondsChanged((seconds) => {
      window.localStorage.setItem("linked_timer_seconds", seconds);
    });

    return () => {
      unsubscribeFromTimerHoursChanged();
      unsubscribeFromTimerMinuteChanged();
      unsubscribeFromTimerSecondsChanged();
    };
  }, []);
  return <></>;
}
