import { createPubSub } from "create-pubsub";
import { type Peer, type DataConnection } from "peerjs";
import { LocalStorageProperties } from "../types/LocalStorageProperties";

export const PingIntervalInMilliseconds = 5000;
export const PeerConnectionTimeoutInMilliseconds = 30000;

export const lastUsedPeerIdLocalStorageProperties: LocalStorageProperties = {
  key: "linked-timer-last-used-peer-id",
  defaultValue: "",
};

export const peerPubSub = createPubSub<Peer | null>(null);
export const [emitPeerChanged, onPeerChanged, getPeer] = peerPubSub;

export const peerConnectionsPubSub = createPubSub<DataConnection[]>([]);
export const [setPeerConnections, onPeerConnectionsChanged, getPeerConnections] = peerConnectionsPubSub;

export const connectedPeerIdsPubSub = createPubSub<string[]>([]);
export const [setConnectedPeerIds, listenToConnectedPeerIds, getConnectedPeerIds] = connectedPeerIdsPubSub;

export const connectionDataReceivedPubSub = createPubSub<{ connection: DataConnection; data: unknown }>();
export const [setConnectionDataReceived, onConnectionDataReceived] = connectionDataReceivedPubSub;

export const [emitConnectionReceived, onConnectionReceived] = createPubSub<DataConnection>();

export const [emitPeerError, onPeerErrorReceived] = createPubSub<Error & { type?: string }>();
