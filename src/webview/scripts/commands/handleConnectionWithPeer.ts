import { DataConnection } from "peerjs";
import { getPeerConnections, setPeerConnections, setConnectionDataReceived } from "../constants/peer";

export function handleConnectionWithPeer(connectionWithPeer: DataConnection) {
  connectionWithPeer.on("open", () => {
    const peerConnections = getPeerConnections();

    const existingConnection = peerConnections.find(
      (existingConnection) => existingConnection.peer === connectionWithPeer.peer
    );

    setPeerConnections([...peerConnections, connectionWithPeer]);

    existingConnection?.close();
  });

  connectionWithPeer.on("close", () => {
    setPeerConnections(getPeerConnections().filter((connection) => connection !== connectionWithPeer));
  });

  connectionWithPeer.on("error", (error) => {
    console.error(error.message);
  });

  connectionWithPeer.on("data", setConnectionDataReceived);
}
