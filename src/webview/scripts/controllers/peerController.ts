import { createPubSub } from "create-pubsub";
import Peer, { DataConnection, PeerJSOption, util } from "peerjs";
import { isRunningInDevEnvironment } from "./appController";

enum PeerErrorType {
  BrowserIncompatible = "browser-incompatible",
  Disconnected = "disconnected",
  InvalidID = "invalid-id",
  InvalidKey = "invalid-key",
  Network = "network",
  PeerUnavailable = "peer-unavailable",
  SslUnavailable = "ssl-unavailable",
  ServerError = "server-error",
  SocketError = "socket-error",
  SocketClosed = "socket-closed",
  UnavailableID = "unavailable-id",
  WebRTC = "webrtc",
}

enum LogLevel {
  Disabled = 0,
  Errors = 1,
  Warnings = 2,
  All = 3,
}

export const peerPubSub = createPubSub<Peer | null>(null);
export const [emitPeerChanged, onPeerChanged, getPeer] = peerPubSub;

export const peerConnectionsPubSub = createPubSub<DataConnection[]>([]);
export const [setPeerConnections, listenToPeerConnections, getPeerConnections] = peerConnectionsPubSub;

export const connectedPeerIdsPubSub = createPubSub<string[]>([]);
export const [setConnectedPeerIds, listenToConnectedPeerIds, getConnectedPeerIds] = connectedPeerIdsPubSub;

export const connectionDataReceivedPubSub = createPubSub<unknown>();
export const [setConnectionDataReceived, listenToConnectionDataReceived] = connectionDataReceivedPubSub;

export const connectToPeer = (requestedPeerIdToConnect: string) => {
  const peer = getPeer();

  const connectedPeerIds = getConnectedPeerIds();

  if (
    !peer ||
    requestedPeerIdToConnect.trim().length === 0 ||
    requestedPeerIdToConnect === peer.id ||
    connectedPeerIds.includes(requestedPeerIdToConnect)
  )
    return;

  const connectionWithPeer = peer.connect(requestedPeerIdToConnect);

  handleConnectionWithPeer(connectionWithPeer);
};

function destroyPeer() {
  getPeer()?.destroy();
}

function createPeer() {
  destroyPeer();

  const peerOptions = {
    host: isRunningInDevEnvironment ? window.location.hostname : util.CLOUD_HOST,
    port: isRunningInDevEnvironment ? 9000 : util.CLOUD_PORT,
    debug: isRunningInDevEnvironment ? LogLevel.Warnings : LogLevel.Disabled,
  } as PeerJSOption;

  const newPeer = new Peer("", peerOptions);

  newPeer.on("open", () => emitPeerChanged(newPeer));
  newPeer.on("close", () => emitPeerChanged(null));
}

export const [emitConnectionReceived, listenToConnectionReceived] = createPubSub<DataConnection>();

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

function handleConnectionWithPeer(connectionWithPeer: DataConnection) {
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

window.addEventListener(
  "DOMContentLoaded",
  () => {
    createPeer();
  },
  { once: true }
);

window.addEventListener(
  "beforeunload",
  () => {
    destroyPeer();
  },
  { once: true }
);

listenToPeerConnections((peerConnections) => setConnectedPeerIds(peerConnections.map((connection) => connection.peer)));
