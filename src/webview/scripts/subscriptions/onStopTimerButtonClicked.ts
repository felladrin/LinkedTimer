import { getPeerConnections } from "../constants/peer";
import { RpcMethod } from "../enumerations/RpcMethod";
import { PeerData } from "../types/PeerData";
import { onStopTimerButtonClicked, stopTimer } from "../constants/timer";

onStopTimerButtonClicked(() => {
  stopTimer();
  getPeerConnections().forEach((peerConnection) => {
    peerConnection.send({ method: RpcMethod.Stop, parameters: null } satisfies PeerData);
  });
});
