import { getPeerConnections } from "../constants/peer";
import { RpcMethod } from "../enumerations/RpcMethod";
import { PeerData } from "../types/PeerData";
import {
  getTimerStartValues,
  setPercentageOfTimeLeft,
  setTimerRunning,
  setTimerValuesString,
  onStartTimerButtonClicked,
  timer,
} from "../constants/timer";

onStartTimerButtonClicked(() => {
  getPeerConnections().forEach((peerConnection) => {
    peerConnection.send({ method: RpcMethod.Start } as PeerData);
  });
  const { hours, minutes, seconds } = getTimerStartValues();
  timer.start({
    startValues: { hours, minutes, seconds },
  });
  setTimerValuesString(timer.getTimeValues().toString());
  setPercentageOfTimeLeft((timer.getTotalTimeValues().seconds / (hours * 3600 + minutes * 60 + seconds)) * 100);
  setTimerRunning(timer.isRunning());
});
