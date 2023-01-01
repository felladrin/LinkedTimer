import { onConnectionDataReceived } from "../constants/peer";
import { connectToPeer } from "../commands/connectToPeer";
import { RpcMethod } from "../enumerations/RpcMethod";
import { EditTimerParameters } from "../types/EditTimerParameters";
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
    case RpcMethod.Ping: {
      connection.metadata.lastPingTimestamp = Date.now();
      break;
    }
  }
});
