export type SyncParameters = {
  isRunning: boolean;
  timeValues: { hours: number; minutes: number; seconds: number };
  totalSeconds: number;
  peerIds: string[];
};
