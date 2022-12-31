import { onConnectionDataReceived } from "../constants/peer";
import { connectToPeer } from "../commands/connectToPeer";
import { RpcMethod } from "../enumerations/RpcMethod";
import { EditTimerParameters } from "../types/EditTimerParameters";
import { SyncParameters } from "../types/SyncParameters";
import { PeerData } from "../types/PeerData";
import { getTimerStartValues, publishTimerStartValues, setTimerRunning, timer } from "../constants/timer";

onConnectionDataReceived((data: unknown) => {
  switch ((data as PeerData).method) {
    case RpcMethod.Sync: {
      const { isRunning, timeValues, totalSeconds, peerIds } = (data as PeerData<SyncParameters>).parameters;
      if (isRunning && Math.abs(totalSeconds - timer.getTotalTimeValues().seconds) > 1) {
        if (timer.isRunning()) timer.stop();
        timer.start({
          startValues: timeValues,
        });
        setTimerRunning(timer.isRunning());
      }
      peerIds.forEach(connectToPeer);
      break;
    }
    case RpcMethod.Start: {
      if (timer.isRunning()) return;
      timer.start({
        startValues: getTimerStartValues(),
      });
      setTimerRunning(timer.isRunning());
      break;
    }
    case RpcMethod.Stop: {
      if (!timer.isRunning()) return;
      timer.stop();
      setTimerRunning(timer.isRunning());
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
