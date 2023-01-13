import { HoursMinutesSeconds } from "./HoursMinutesSeconds";

export type PeriodicSyncParameters = {
  isRunning: boolean;
  timeValues: HoursMinutesSeconds;
  totalSeconds: number;
};
