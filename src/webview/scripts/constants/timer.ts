import { createPubSub } from "create-pubsub";
import Timer, { TimerEvent, TimerEventType } from "easytimer.js";
import { LocalStorageProperties } from "../types/LocalStorageProperties";

const timerStartValues = { hours: 0, minutes: 0, seconds: 15 };

const timer = new Timer({
  countdown: true,
  startValues: timerStartValues,
});

const timerStartValuesLocalStorageProperties: LocalStorageProperties = {
  key: "linked-timer-start-values",
  defaultValue: JSON.stringify(timerStartValues),
};

export const startTimerButtonClickedPubSub = createPubSub();
export const [emitStartTimerButtonClicked, onStartTimerButtonClicked] = startTimerButtonClickedPubSub;

export const stopTimerButtonClickedPubSub = createPubSub();
export const [emitStopTimerButtonClicked, onStopTimerButtonClicked] = stopTimerButtonClickedPubSub;

export const [emitTimerTargetAchieved, onTimerTargetAchieved] = createPubSub<TimerEvent>();

export const percentageOfTimeLeftPubSub = createPubSub(100);
export const [setPercentageOfTimeLeft] = percentageOfTimeLeftPubSub;

export const [setTimerValues, onTimerValuesUpdated, getTimerValues] = createPubSub({
  hours: timer.getTimeValues().hours,
  minutes: timer.getTimeValues().minutes,
  seconds: timer.getTimeValues().seconds,
});

export const timerValuesStringPubSub = createPubSub(timer.getTimeValues().toString());
export const [setTimerValuesString, onTimerValuesStringUpdated] = timerValuesStringPubSub;

export const isTimerRunningPubSub = createPubSub(timer.isRunning());
export const [setTimerRunning, , isTimerRunning] = isTimerRunningPubSub;

export const timerStartValuesPubSub = createPubSub<{
  hours: number;
  minutes: number;
  seconds: number;
}>(
  JSON.parse(
    window.localStorage.getItem(timerStartValuesLocalStorageProperties.key) ??
      timerStartValuesLocalStorageProperties.defaultValue
  )
);
export const [publishTimerStartValues, onTimerStartValuesUpdated, getTimerStartValues] = timerStartValuesPubSub;

export const [startTimerWithValues, onStartTimerWithValuesCommandReceived] = createPubSub<{
  hours: number;
  minutes: number;
  seconds: number;
}>();

export const [startTimer, onStartTimerCommandReceived] = createPubSub();

export const [stopTimer, onStopTimerCommandReceived] = createPubSub();

export const [setTotalTimerSeconds, onTotalTimerSecondsUpdated, getTotalTimerSeconds] = createPubSub(
  timer.getTotalTimeValues().seconds
);

timer.on("targetAchieved", emitTimerTargetAchieved);

(["started", "stopped"] as TimerEventType[]).forEach((eventType) => {
  timer.on(eventType, () => {
    setTimerRunning(timer.isRunning());
  });
});

(["started", "stopped", "secondsUpdated"] as TimerEventType[]).forEach((eventType) => {
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

onStartTimerWithValuesCommandReceived((startValues) => {
  if (timer.isRunning()) timer.stop();
  timer.start({ startValues });
});

onStartTimerCommandReceived(() => {
  if (timer.isRunning()) return;
  timer.start({ startValues: getTimerStartValues() });
});

onStopTimerCommandReceived(() => {
  if (!timer.isRunning()) return;
  timer.stop();
});

onTimerStartValuesUpdated((timerStartValues) => {
  window.localStorage.setItem(timerStartValuesLocalStorageProperties.key, JSON.stringify(timerStartValues));
});
