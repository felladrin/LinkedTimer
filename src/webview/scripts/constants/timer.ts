import { createPubSub } from "create-pubsub";
import Timer, { TimerEvent, TimerEventType } from "easytimer.js";
import { HoursMinutesSeconds, LocalStorageProperties } from "../types";

const timerStartValues = { hours: 0, minutes: 0, seconds: 15 };

const timer = new Timer({
  countdown: true,
  startValues: timerStartValues,
});

const timerStartValuesLocalStorageProperties: LocalStorageProperties = {
  key: "linked-timer-start-values",
  defaultValue: JSON.stringify(timerStartValues),
};

export const [emitStartTimerButtonClicked, onStartTimerButtonClicked] = createPubSub();

export const [emitStopTimerButtonClicked, onStopTimerButtonClicked] = createPubSub();

export const percentageOfTimeLeftPubSub = createPubSub(100);
const [setPercentageOfTimeLeft] = percentageOfTimeLeftPubSub;

const [setTimerValues, , getTimerValues] = createPubSub({
  hours: timer.getTimeValues().hours,
  minutes: timer.getTimeValues().minutes,
  seconds: timer.getTimeValues().seconds,
});
export { getTimerValues };

export const timerValuesStringPubSub = createPubSub(timer.getTimeValues().toString());
const [setTimerValuesString, onTimerValuesStringUpdated] = timerValuesStringPubSub;
export { onTimerValuesStringUpdated };

export const isTimerRunningPubSub = createPubSub(timer.isRunning());
const [setTimerRunning, , isTimerRunning] = isTimerRunningPubSub;
export { isTimerRunning };

export const timerStartValuesPubSub = createPubSub<HoursMinutesSeconds>(
  JSON.parse(
    window.localStorage.getItem(timerStartValuesLocalStorageProperties.key) ??
      timerStartValuesLocalStorageProperties.defaultValue
  )
);
export const [publishTimerStartValues, onTimerStartValuesUpdated, getTimerStartValues] = timerStartValuesPubSub;

const [setTotalTimerSeconds, onTotalTimerSecondsUpdated, getTotalTimerSeconds] = createPubSub(
  timer.getTotalTimeValues().seconds
);
export { onTotalTimerSecondsUpdated, getTotalTimerSeconds };

export function onTimerTargetAchieved(handler: (event: TimerEvent) => void) {
  timer.on("targetAchieved", handler);
}

export function configureTimerEventHandlers() {
  (["started", "stopped", "secondsUpdated"] satisfies TimerEventType[]).forEach((eventType) => {
    timer.on(eventType, () => {
      setTimerValues({
        hours: timer.getTimeValues().hours,
        minutes: timer.getTimeValues().minutes,
        seconds: timer.getTimeValues().seconds,
      });
      setTimerValuesString(timer.getTimeValues().toString());
      setTotalTimerSeconds(timer.getTotalTimeValues().seconds);
      const { hours, minutes, seconds } = getTimerStartValues();
      setPercentageOfTimeLeft((getTotalTimerSeconds() / (hours * 3600 + minutes * 60 + seconds)) * 100);
    });
  });

  (["started", "stopped"] satisfies TimerEventType[]).forEach((eventType) => {
    timer.on(eventType, () => {
      setTimerRunning(timer.isRunning());
    });
  });
}

export function startTimerWithValues(startValues: HoursMinutesSeconds) {
  if (timer.isRunning()) timer.stop();
  timer.start({ startValues });
}

export function startTimer() {
  if (timer.isRunning()) return;
  timer.start({ startValues: getTimerStartValues() });
}

export function stopTimer() {
  if (!timer.isRunning()) return;
  timer.stop();
}

export function saveTimerStartValuesToLocalStorage(timerStartValues: HoursMinutesSeconds) {
  window.localStorage.setItem(timerStartValuesLocalStorageProperties.key, JSON.stringify(timerStartValues));
}
