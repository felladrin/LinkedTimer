import { DataConnection } from "peerjs";
import { getConnectedPeerIds } from "../constants/peer";
import { RpcMethod } from "../enumerations/RpcMethod";
import { SyncParameters } from "../types/SyncParameters";
import { PeerData } from "../types/PeerData";
import { getTimerValues, getTotalTimerSeconds, isTimerRunning } from "../constants/timer";

export function sendSyncTimerToPeerConnection(peerConnection: DataConnection) {
  peerConnection.send({
    method: RpcMethod.Sync,
    parameters: {
      isRunning: isTimerRunning(),
      timeValues: getTimerValues(),
      totalSeconds: getTotalTimerSeconds(),
      peerIds: getConnectedPeerIds(),
    },
  } as PeerData<SyncParameters>);
}
