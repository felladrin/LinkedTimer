import { getPeerConnections } from "../constants/peer";
import { RpcMethod } from "../enumerations/RpcMethod";
import { PeerData } from "../types/PeerData";
import {
  getTimerStartValues,
  setPercentageOfTimeLeft,
  setTimerRunning,
  setTimerValuesString,
  onStopTimerButtonClicked,
  timer,
} from "../constants/timer";

onStopTimerButtonClicked(() => {
  getPeerConnections().forEach((peerConnection) => {
    peerConnection.send({ method: RpcMethod.Stop } as PeerData);
  });
  const { hours, minutes, seconds } = getTimerStartValues();
  timer.stop();
  setTimerValuesString(timer.getTimeValues().toString());
  setPercentageOfTimeLeft((timer.getTotalTimeValues().seconds / (hours * 3600 + minutes * 60 + seconds)) * 100);
  setTimerRunning(timer.isRunning());
});
