import { getPeerConnections } from "../constants/peer";
import { RpcMethod } from "../enumerations/RpcMethod";
import { PeerData } from "../types/PeerData";
import { onStartTimerButtonClicked, startTimer } from "../constants/timer";

onStartTimerButtonClicked(() => {
  startTimer();
  getPeerConnections().forEach((peerConnection) => {
    peerConnection.send({ method: RpcMethod.Start } as PeerData);
  });
});
