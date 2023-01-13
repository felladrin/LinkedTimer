import { HoursMinutesSeconds } from "./HoursMinutesSeconds";
import { PeriodicSyncParameters } from "./PeriodicSyncParameters";

export type InitialSyncParameters = PeriodicSyncParameters & {
  timerEditorConfiguration: HoursMinutesSeconds;
  joinRoomTimestamp: number;
};
