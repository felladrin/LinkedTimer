import { type DataConnection } from "peerjs";
import {
  getPeerConnections,
  setPeerConnections,
  setConnectionDataReceived,
  emitPeerError,
  PingIntervalInMilliseconds,
  PeerConnectionTimeoutInMilliseconds,
} from "../constants/peer";
import { RpcMethod } from "../enumerations/RpcMethod";
import { type PeerData } from "../types/PeerData";

export function handleConnectionWithPeer(connectionWithPeer: DataConnection) {
  let pingCheckerInterval = 0;

  connectionWithPeer.on("open", () => {
    const peerConnections = getPeerConnections();

    const existingConnection = peerConnections.find(
      (existingConnection) => existingConnection.peer === connectionWithPeer.peer
    );

    setPeerConnections([...peerConnections, connectionWithPeer]);

    existingConnection?.close();

    pingCheckerInterval = window.setInterval(() => {
      connectionWithPeer.send({ method: RpcMethod.Ping } as PeerData);

      if (Date.now() - connectionWithPeer.metadata.lastPingTimestamp > PeerConnectionTimeoutInMilliseconds) {
        connectionWithPeer.close();
      }
    }, PingIntervalInMilliseconds);
  });

  connectionWithPeer.on("close", () => {
    setPeerConnections(getPeerConnections().filter((connection) => connection !== connectionWithPeer));

    if (pingCheckerInterval) window.clearInterval(pingCheckerInterval);
  });

  connectionWithPeer.on("error", emitPeerError);

  connectionWithPeer.on("data", (data) => setConnectionDataReceived({ connection: connectionWithPeer, data }));
}
