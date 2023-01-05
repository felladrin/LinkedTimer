import { getPeer, onConnectedPeerIdsUpdated, PingIntervalInMilliseconds, saveConnectedPeerIdsOnLastSession } from "../constants/peer";

onConnectedPeerIdsUpdated((peerIds) => {
  window.setTimeout(() => {
    const peerId = getPeer()?.id;

    if (peerId) saveConnectedPeerIdsOnLastSession(peerId, peerIds);
  }, PingIntervalInMilliseconds);
});
