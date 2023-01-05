import { connectToPeer } from "../constants/peer";
import { handleConnectionWithPeer } from "../constants/peer";
import {
  onPeerChanged,
  emitConnectionReceived,
  emitPeerError,
  getConnectedPeerIdsOnLastSession,
} from "../constants/peer";

onPeerChanged((peer) => {
  if (!peer) return;

  peer.on("disconnected", () => {
    const intervalId = window.setInterval(() => {
      if (!peer.disconnected || peer.destroyed) {
        window.clearInterval(intervalId);
        return;
      }

      peer.reconnect();
    }, 1000);
  });

  peer.on("error", emitPeerError);

  peer.on("connection", (connectionWithPeer) => {
    connectionWithPeer.once("open", () => emitConnectionReceived(connectionWithPeer));
    handleConnectionWithPeer(connectionWithPeer);
  });

  getConnectedPeerIdsOnLastSession(peer.id)?.forEach(connectToPeer);
});
