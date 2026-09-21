export type HoursMinutesSeconds = {
  hours: number;
  minutes: number;
  seconds: number;
};

export type PeriodicSyncParameters = {
  isRunning: boolean;
  timeValues: HoursMinutesSeconds;
  totalSeconds: number;
  joinRoomTimestamp: number;
};

export type InitialSyncParameters = PeriodicSyncParameters & {
  timerEditorConfiguration: HoursMinutesSeconds;
};

export type LocalStorageProperties = {
  key: string;
  defaultValue: string;
};
