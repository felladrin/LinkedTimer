import { onPeerConnectionsChanged, setConnectedPeerIds } from "../constants/peer";

onPeerConnectionsChanged((peerConnections) =>
  setConnectedPeerIds(peerConnections.map((connection) => connection.peer))
);
