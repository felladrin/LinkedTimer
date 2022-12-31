import { DataConnection } from "peerjs";
import { getConnectedPeerIds } from "../constants/peer";
import { RpcMethod } from "../enumerations/RpcMethod";
import { SyncParameters } from "../types/SyncParameters";
import { PeerData } from "../types/PeerData";
import { timer } from "../constants/timer";

export function sendSyncTimerToPeerConnection(peerConnection: DataConnection) {
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
