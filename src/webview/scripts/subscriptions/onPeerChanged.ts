import { PeerErrorType } from "../enumerations/PeerErrorType";
import { handleConnectionWithPeer } from "../commands/handleConnectionWithPeer";
import { onPeerChanged, emitConnectionReceived } from "../constants/peer";

onPeerChanged((peer) => {
  if (!peer) return;

  peer.on("disconnected", () => {
    setTimeout(() => {
      if (!peer.destroyed) peer.reconnect();
    }, 3000);
  });

  peer.on("error", (error: unknown) => {
    if ((error as { type: PeerErrorType }).type === PeerErrorType.UnavailableID) {
      throw error;
    }
  });

  peer.on("connection", (connectionWithPeer) => {
    connectionWithPeer.once("open", () => emitConnectionReceived(connectionWithPeer));
    handleConnectionWithPeer(connectionWithPeer);
  });
});
