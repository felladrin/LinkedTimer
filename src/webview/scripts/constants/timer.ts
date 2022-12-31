import { createPubSub } from "create-pubsub";
import Timer, { TimerEvent } from "easytimer.js";

const timerStartValues = { hours: 0, minutes: 0, seconds: 15 };

export const timer = new Timer({
  countdown: true,
  startValues: timerStartValues,
});

export const timerStartValuesLocalStorageProperties = {
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

export const timerValuesStringPubSub = createPubSub(timer.getTimeValues().toString());
export const [setTimerValuesString, onTimerValuesStringUpdated] = timerValuesStringPubSub;

export const isTimerRunningPubSub = createPubSub(timer.isRunning());
export const [setTimerRunning] = isTimerRunningPubSub;

export const timerStartValuesPubSub = createPubSub(
  JSON.parse(
    window.localStorage.getItem(timerStartValuesLocalStorageProperties.key) ??
      timerStartValuesLocalStorageProperties.defaultValue
  )
);
export const [publishTimerStartValues, onTimerStartValuesUpdated, getTimerStartValues] = timerStartValuesPubSub;

export const [publishTimerSecondsUpdated, onTimerSecondsUpdated] = createPubSub();

timer.on("secondsUpdated", () => publishTimerSecondsUpdated());

timer.on("targetAchieved", emitTimerTargetAchieved);
