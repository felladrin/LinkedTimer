import { createPubSub } from "create-pubsub";
import Peer, { DataConnection } from "peerjs";

export const peerPubSub = createPubSub<Peer | null>(null);
export const [emitPeerChanged, onPeerChanged, getPeer] = peerPubSub;

export const peerConnectionsPubSub = createPubSub<DataConnection[]>([]);
export const [setPeerConnections, onPeerConnectionsChanged, getPeerConnections] = peerConnectionsPubSub;

export const connectedPeerIdsPubSub = createPubSub<string[]>([]);
export const [setConnectedPeerIds, listenToConnectedPeerIds, getConnectedPeerIds] = connectedPeerIdsPubSub;

export const connectionDataReceivedPubSub = createPubSub<unknown>();
export const [setConnectionDataReceived, onConnectionDataReceived] = connectionDataReceivedPubSub;

export const [emitConnectionReceived, onConnectionReceived] = createPubSub<DataConnection>();
