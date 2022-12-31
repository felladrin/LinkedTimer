import { createPubSub } from "create-pubsub";
import Timer, { TimerEvent, TimerEventType } from "easytimer.js";
import { DataConnection } from "peerjs";
import {
  connectToPeer,
  getConnectedPeerIds,
  getPeer,
  getPeerConnections,
  listenToConnectionDataReceived,
  listenToConnectionReceived,
} from "./peerController";

enum RpcMethod {
  Start = "Start",
  Stop = "Stop",
  Sync = "Sync",
  EditTimer = "EditTimer",
}

type EditTimerParameters = {
  hours: number;
  minutes: number;
  seconds: number;
};

type SyncParameters = {
  isRunning: boolean;
  timeValues: { hours: number; minutes: number; seconds: number };
  totalSeconds: number;
  peerIds: string[];
};

type PeerData<T = void> = {
  method: RpcMethod;
  parameters: T;
};

const startValues = { hours: 0, minutes: 0, seconds: 15 };

export const timer = new Timer({
  countdown: true,
  startValues: startValues,
});

export const timerStartValuesLocalStorageProperties = {
  key: "linked-timer-start-values",
  defaultValue: JSON.stringify(startValues),
};

export const startTimerButtonClickedPubSub = createPubSub();
export const [emitStartTimerButtonClicked, subStartTimerButtonClicked] = startTimerButtonClickedPubSub;

export const stopTimerButtonClickedPubSub = createPubSub();
export const [emitStopTimerButtonClicked, subStopTimerButtonClicked] = stopTimerButtonClickedPubSub;

export const [emitTimerTargetAchieved, listenToTimerTargetAchieved] = createPubSub<TimerEvent>();

export const percentageOfTimeLeftPubSub = createPubSub(100);
const [setPercentageOfTimeLeft] = percentageOfTimeLeftPubSub;

export const timerValuesStringPubSub = createPubSub(timer.getTimeValues().toString());
export const [setTimerValuesString, listenToTimerValuesString] = timerValuesStringPubSub;

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

export const timerStartValuesPubSub = createPubSub(
  JSON.parse(
    window.localStorage.getItem(timerStartValuesLocalStorageProperties.key) ??
      timerStartValuesLocalStorageProperties.defaultValue
  )
);
export const [publishTimerStartValues, listenToTimerStartValues, getTimerStartValues] = timerStartValuesPubSub;

listenToTimerStartValues((timerStartValues) => {
  window.localStorage.setItem(timerStartValuesLocalStorageProperties.key, JSON.stringify(timerStartValues));
});

subStartTimerButtonClicked(() => {
  timer.start({
    startValues: getTimerStartValues(),
  });
});

(["started", "stopped", "secondsUpdated"] as TimerEventType[]).forEach((timerEventType) => {
  timer.on(timerEventType, () => {
    const { hours, minutes, seconds } = getTimerStartValues();
    setPercentageOfTimeLeft((timer.getTotalTimeValues().seconds / (hours * 3600 + minutes * 60 + seconds)) * 100);
  });
});

function sendSyncTimerToPeerConnection(peerConnection: DataConnection) {
  const { hours, minutes, seconds } = timer.getTimeValues();
  const timeValues = { hours, minutes, seconds };
  const totalSeconds = timer.getTotalTimeValues().seconds;
  const peerIds = getConnectedPeerIds();
  const isRunning = timer.isRunning();

  peerConnection.send({
    method: RpcMethod.Sync,
    parameters: {
      isRunning,
      timeValues,
      totalSeconds,
      peerIds,
    },
  } as PeerData<SyncParameters>);
}

timer.on("secondsUpdated", () => {
  getPeerConnections().forEach((peerConnection) => {
    sendSyncTimerToPeerConnection(peerConnection);
  });
});

timer.on("stopped", () => {
  getPeerConnections().forEach((peerConnection) => {
    peerConnection.send({ method: RpcMethod.Stop } as PeerData);
  });
});

timer.on("started", () => {
  getPeerConnections().forEach((peerConnection) => {
    peerConnection.send({ method: RpcMethod.Start } as PeerData);
  });
});

listenToConnectionDataReceived((data: unknown) => {
  switch ((data as PeerData).method) {
    case RpcMethod.Sync: {
      const { isRunning, timeValues, totalSeconds, peerIds } = (data as PeerData<SyncParameters>).parameters;
      if (isRunning && Math.abs(totalSeconds - timer.getTotalTimeValues().seconds) > 1) {
        if (timer.isRunning()) timer.stop();
        timer.start({
          startValues: timeValues,
        });
      }
      peerIds.forEach(connectToPeer);
      break;
    }
    case RpcMethod.Start: {
      if (timer.isRunning()) return;
      timer.start({
        startValues: getTimerStartValues(),
      });
      break;
    }
    case RpcMethod.Stop: {
      if (timer.isRunning()) timer.stop();
      break;
    }
    case RpcMethod.EditTimer: {
      const { hours, minutes, seconds } = (data as PeerData<EditTimerParameters>).parameters;
      const { hours: currentTours, minutes: currentMinutes, seconds: currentSeconds } = getTimerStartValues();
      if (hours !== currentTours || minutes !== currentMinutes || seconds !== currentSeconds) {
        publishTimerStartValues({
          hours,
          minutes,
          seconds,
        });
      }
      break;
    }
  }
});

function sendEditTimerToPeerConnection(peerConnection: DataConnection) {
  peerConnection.send({
    method: RpcMethod.EditTimer,
    parameters: getTimerStartValues(),
  } as PeerData<EditTimerParameters>);
}

listenToTimerStartValues(() => getPeerConnections().forEach(sendEditTimerToPeerConnection));

listenToConnectionReceived(timer.isRunning() ? sendSyncTimerToPeerConnection : sendEditTimerToPeerConnection);
