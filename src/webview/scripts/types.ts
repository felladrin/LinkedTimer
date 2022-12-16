import { TimeCounter, TimerParams } from "easytimer.js";

export type EditTimerNotification = {
  hours: string;
  minutes: string;
  seconds: string;
};

export type SyncNotification = {
  config: TimerParams;
  timeValues: TimeCounter;
  totalSeconds: number;
};