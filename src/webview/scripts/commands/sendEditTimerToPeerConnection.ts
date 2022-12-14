import { DataConnection } from "peerjs";
import { RpcMethod } from "../enumerations/RpcMethod";
import { HoursMinutesSeconds } from "../types/HoursMinutesSeconds";
import { PeerData } from "../types/PeerData";
import { getTimerStartValues } from "../constants/timer";

export function sendEditTimerToPeerConnection(peerConnection: DataConnection) {
  peerConnection.send({
    method: RpcMethod.EditTimer,
    parameters: getTimerStartValues(),
  } satisfies PeerData<HoursMinutesSeconds>);
}
