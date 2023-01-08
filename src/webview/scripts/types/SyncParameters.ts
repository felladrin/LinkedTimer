import { HoursMinutesSeconds } from "./HoursMinutesSeconds";

export type SyncParameters = {
  isRunning: boolean;
  timeValues: HoursMinutesSeconds;
  totalSeconds: number;
  peerIds: string[];
};
