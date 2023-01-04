import { createPubSub } from "create-pubsub";
import Timer, { TimerEvent, TimerEventType } from "easytimer.js";
import { CreatePubSubMethods } from "../enumerations/CreatePubSubMethods";
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
export const emitStartTimerButtonClicked = startTimerButtonClickedPubSub[CreatePubSubMethods.Publish];
export const onStartTimerButtonClicked = startTimerButtonClickedPubSub[CreatePubSubMethods.Subscribe];

export const stopTimerButtonClickedPubSub = createPubSub();
export const emitStopTimerButtonClicked = stopTimerButtonClickedPubSub[CreatePubSubMethods.Publish];
export const onStopTimerButtonClicked = stopTimerButtonClickedPubSub[CreatePubSubMethods.Subscribe];

export const percentageOfTimeLeftPubSub = createPubSub(100);
export const setPercentageOfTimeLeft = percentageOfTimeLeftPubSub[CreatePubSubMethods.Publish];

export const [setTimerValues, onTimerValuesUpdated, getTimerValues] = createPubSub({
  hours: timer.getTimeValues().hours,
  minutes: timer.getTimeValues().minutes,
  seconds: timer.getTimeValues().seconds,
});

export const timerValuesStringPubSub = createPubSub(timer.getTimeValues().toString());
const setTimerValuesString = timerValuesStringPubSub[CreatePubSubMethods.Publish];
export const onTimerValuesStringUpdated = timerValuesStringPubSub[CreatePubSubMethods.Subscribe];

export const isTimerRunningPubSub = createPubSub(timer.isRunning());
const setTimerRunning = isTimerRunningPubSub[CreatePubSubMethods.Publish];
export const isTimerRunning = isTimerRunningPubSub[CreatePubSubMethods.Get];

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
export const publishTimerStartValues = timerStartValuesPubSub[CreatePubSubMethods.Publish];
export const onTimerStartValuesUpdated = timerStartValuesPubSub[CreatePubSubMethods.Subscribe];
export const getTimerStartValues = timerStartValuesPubSub[CreatePubSubMethods.Get];

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

export function onTimerTargetAchieved(handler: (event: TimerEvent) => void) {
  timer.on("targetAchieved", handler);
}

export const handleTimerStartedOrStopped = (eventType: TimerEventType) => {
  timer.on(eventType, () => {
    setTimerRunning(timer.isRunning());
  });
};

export function onTimerStartedOrStopped(handler: (eventType: TimerEventType) => void) {
  (["started", "stopped"] as TimerEventType[]).forEach(handler);
}

export function handleTimerUpdated(eventType: TimerEventType) {
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
}
export function onTimerUpdated(handler: (eventType: TimerEventType) => void) {
  (["started", "stopped", "secondsUpdated"] as TimerEventType[]).forEach(handler);
}

export function handleStartTimerWithValuesCommandReceived(startValues: {
  hours: number;
  minutes: number;
  seconds: number;
}) {
  if (timer.isRunning()) timer.stop();
  timer.start({ startValues });
}

export function handleStartTimerCommandReceived() {
  if (timer.isRunning()) return;
  timer.start({ startValues: getTimerStartValues() });
}

export function handleStopTimerCommandReceived() {
  if (!timer.isRunning()) return;
  timer.stop();
}

export function handleTimerStartValueUpdated(timerStartValues: { hours: number; minutes: number; seconds: number }) {
  window.localStorage.setItem(timerStartValuesLocalStorageProperties.key, JSON.stringify(timerStartValues));
}
