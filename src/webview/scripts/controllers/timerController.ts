import { IStorageProperties } from "@mantine/hooks/lib/use-local-storage/create-storage";
import { createPubSub } from "create-pubsub";
import Timer, { TimerEvent, TimerEventType } from "easytimer.js";

export const timer = new Timer({
  countdown: true,
  startValues: { hours: 0, minutes: 0, seconds: 15 },
});

export const timerHoursLocalStorageProperties: IStorageProperties<number> = {
  key: "linked-timer-hours",
  defaultValue: 0,
};

export const timerMinutesLocalStorageProperties: IStorageProperties<number> = {
  key: "linked-timer-minutes",
  defaultValue: 0,
};

export const timerSecondsLocalStorageProperties: IStorageProperties<number> = {
  key: "linked-timer-seconds",
  defaultValue: 15,
};

export const startTimerButtonClickedPubSub = createPubSub();
export const [emitStartTimerButtonClicked, subStartTimerButtonClicked] = startTimerButtonClickedPubSub;

export const stopTimerButtonClickedPubSub = createPubSub();
export const [emitStopTimerButtonClicked, subStopTimerButtonClicked] = stopTimerButtonClickedPubSub;

export const [emitTimerTargetAchieved, listenToTimerTargetAchieved] = createPubSub<TimerEvent>();

export const percentageOfTimeLeftPubSub = createPubSub(100);
const [setPercentageOfTimeLeft] = percentageOfTimeLeftPubSub;

export const timerValuesStringPubSub = createPubSub(timer.getTimeValues().toString());
const [setTimerValuesString] = timerValuesStringPubSub;

export const isTimerRunningPubSub = createPubSub(timer.isRunning());
const [setTimerRunning] = isTimerRunningPubSub;

(["started", "stopped", "secondsUpdated"] as TimerEventType[]).forEach((timerEventType) => {
  timer.on(timerEventType, () => {
    setTimerRunning(timer.isRunning());
    setTimerValuesString(timer.getTimeValues().toString());
  });
});

timer.on("targetAchieved", emitTimerTargetAchieved);

subStopTimerButtonClicked(timer.stop);

function getTimerSeconds() {
  return Number(
    window.localStorage.getItem(timerSecondsLocalStorageProperties.key) ??
      timerSecondsLocalStorageProperties.defaultValue
  );
}

function getTimerMinutes() {
  return Number(
    window.localStorage.getItem(timerMinutesLocalStorageProperties.key) ??
      timerMinutesLocalStorageProperties.defaultValue
  );
}

function getTimerHours() {
  return Number(
    window.localStorage.getItem(timerHoursLocalStorageProperties.key) ?? timerHoursLocalStorageProperties.defaultValue
  );
}

subStartTimerButtonClicked(() => {
  timer.start({
    startValues: {
      hours: getTimerHours(),
      minutes: getTimerMinutes(),
      seconds: getTimerSeconds(),
    },
  });
});

(["started", "stopped", "secondsUpdated"] as TimerEventType[]).forEach((timerEventType) => {
  timer.on(timerEventType, () => {
    setPercentageOfTimeLeft(
      (timer.getTotalTimeValues().seconds / (getTimerHours() * 3600 + getTimerMinutes() * 60 + getTimerSeconds())) * 100
    );
  });
});
