import { onConnectionDataReceived } from "../constants/peer";
import { connectToPeer } from "../constants/peer";
import { RpcMethod } from "../enumerations/RpcMethod";
import { HoursMinutesSeconds } from "../types/HoursMinutesSeconds";
import { SyncParameters } from "../types/SyncParameters";
import { PeerData } from "../types/PeerData";
import {
  getTimerStartValues,
  getTotalTimerSeconds,
  publishTimerStartValues,
  startTimer,
  startTimerWithValues,
  stopTimer,
} from "../constants/timer";

onConnectionDataReceived(({ connection, data }) => {
  switch ((data as PeerData).method) {
    case RpcMethod.Sync: {
      const { isRunning, timeValues, totalSeconds, peerIds } = (data as PeerData<SyncParameters>).parameters;
      if (isRunning && Math.abs(totalSeconds - getTotalTimerSeconds()) > 1) {
        startTimerWithValues(timeValues);
      }
      peerIds.forEach(connectToPeer);
      break;
    }
    case RpcMethod.Start: {
      startTimer();
      break;
    }
    case RpcMethod.Stop: {
      stopTimer();
      break;
    }
    case RpcMethod.EditTimer: {
      const current = getTimerStartValues();
      const expected = (data as PeerData<HoursMinutesSeconds>).parameters;
      if (
        current.hours !== expected.hours ||
        current.minutes !== expected.minutes ||
        current.seconds !== expected.seconds
      ) {
        publishTimerStartValues(() => expected);
      }
      break;
    }
    case RpcMethod.Ping: {
      connection.metadata.lastPingTimestamp = Date.now();
      break;
    }
  }
});
