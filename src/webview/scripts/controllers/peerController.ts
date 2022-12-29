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
const [emitPeerChanged, onPeerChanged, getPeer] = peerPubSub;

export const peerConnectionsPubSub = createPubSub<DataConnection[]>([]);
const [setPeerConnections, , getPeerConnections] = peerConnectionsPubSub;

export const connectToPeer = (requestedPeerIdToConnect: string) => {
  const peer = getPeer();

  if (requestedPeerIdToConnect.trim().length === 0 || !peer) return;

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

  peer.on("connection", handleConnectionWithPeer);
});

function handleConnectionWithPeer(connectionWithPeer: DataConnection) {
  connectionWithPeer.on("open", () => {
    setPeerConnections([...getPeerConnections(), connectionWithPeer]);
  });

  connectionWithPeer.on("close", () => {
    setPeerConnections(getPeerConnections().filter((connection) => connection !== connectionWithPeer));
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
