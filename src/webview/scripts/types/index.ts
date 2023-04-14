export type HoursMinutesSeconds = {
  hours: number;
  minutes: number;
  seconds: number;
};

export type PeriodicSyncParameters = {
  isRunning: boolean;
  timeValues: HoursMinutesSeconds;
  totalSeconds: number;
};

export type InitialSyncParameters = PeriodicSyncParameters & {
  timerEditorConfiguration: HoursMinutesSeconds;
  joinRoomTimestamp: number;
};

export type LocalStorageProperties = {
  key: string;
  defaultValue: string;
};
