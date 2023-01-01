import { getConnectedPeerIds, getPeer } from "../constants/peer";
import { handleConnectionWithPeer } from "./handleConnectionWithPeer";

export function connectToPeer(requestedPeerIdToConnect: string) {
  const peer = getPeer();

  const connectedPeerIds = getConnectedPeerIds();

  if (
    !peer ||
    requestedPeerIdToConnect.trim().length === 0 ||
    requestedPeerIdToConnect === peer.id ||
    connectedPeerIds.includes(requestedPeerIdToConnect)
  )
    return;

  const connectionWithPeer = peer.connect(requestedPeerIdToConnect, { metadata: { lastPingTimestamp: Date.now() } });

  handleConnectionWithPeer(connectionWithPeer);
}
