export type HoursMinutesSeconds = {
  hours: number;
  minutes: number;
  seconds: number;
};

export type PeriodicSyncParameters = {
  isRunning: boolean;
  timeValues: HoursMinutesSeconds;
  totalSeconds: number;
  // The emitting peer's local room creation timestamp. Required so every emitter sets it, but
  // receivers must tolerate its absence: peers predating #1203 omit the field entirely.
  joinRoomTimestamp: number;
};

export type InitialSyncParameters = PeriodicSyncParameters & {
  timerEditorConfiguration: HoursMinutesSeconds;
};

export type LocalStorageProperties = {
  key: string;
  defaultValue: string;
};
