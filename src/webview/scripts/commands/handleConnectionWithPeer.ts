import { DataConnection } from "peerjs";
import { getPeerConnections, setPeerConnections, setConnectionDataReceived } from "../constants/peer";

export function handleConnectionWithPeer(connectionWithPeer: DataConnection) {
  connectionWithPeer.on("open", () => {
    const peerConnections = getPeerConnections();

    const existingConnection = peerConnections.find(
      (existingConnection) => existingConnection.peer === connectionWithPeer.peer
    );

    setPeerConnections([...peerConnections, connectionWithPeer]);

    connectionWithPeer.on("data", setConnectionDataReceived);

    existingConnection?.close();
  });

  connectionWithPeer.on("close", () => {
    setPeerConnections(getPeerConnections().filter((connection) => connection !== connectionWithPeer));

    connectionWithPeer.off("data", setConnectionDataReceived);
  });
}
