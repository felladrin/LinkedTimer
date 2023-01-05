import { createPubSub } from "create-pubsub";
import { createImmerPubSub } from "create-pubsub/immer";
import { type DataConnection } from "peerjs";
import { LocalStorageProperties } from "../types/LocalStorageProperties";
import Peer, { PeerJSOption } from "peerjs";
import { PeerLogLevel } from "../enumerations/PeerLogLevel";
import { PeerErrorType } from "../enumerations/PeerErrorType";
// @ts-expect-error - Parcel supports importing YAML files (https://parceljs.org/languages/yaml)
import gitpodConfiguration from "../../../../.gitpod.yml";
import { RpcMethod } from "../enumerations/RpcMethod";
import { PeerData } from "../types/PeerData";

export const PingIntervalInMilliseconds = 5000;
export const PeerConnectionTimeoutInMilliseconds = 30000;

export const lastUsedPeerIdLocalStorageProperties: LocalStorageProperties = {
  key: "linked-timer-last-used-peer-id",
  defaultValue: "",
};

export const connectedPeerIdsLocalStorageProperties: LocalStorageProperties = {
  key: "linked-timer-connected-peer-ids",
  defaultValue: "{}",
};

export const peerPubSub = createPubSub<Peer | null>(null);
export const [emitPeerChanged, onPeerChanged, getPeer] = peerPubSub;

export const peerConnectionsPubSub = createImmerPubSub<DataConnection[]>([]);
export const [setPeerConnections, onPeerConnectionsChanged, getPeerConnections] = peerConnectionsPubSub;

export const connectedPeerIdsPubSub = createPubSub<string[]>([]);
export const [setConnectedPeerIds, onConnectedPeerIdsUpdated, getConnectedPeerIds] = connectedPeerIdsPubSub;

export const connectionDataReceivedPubSub = createPubSub<{ connection: DataConnection; data: unknown }>();
export const [setConnectionDataReceived, onConnectionDataReceived] = connectionDataReceivedPubSub;

export const [emitConnectionReceived, onConnectionReceived] = createPubSub<DataConnection>();

export const [emitPeerError, onPeerErrorReceived] = createPubSub<Error & { type?: string }>();

function loadConnectedPeerIdsOnLastSession(): { [key: string]: string[] } {
  return JSON.parse(
    window.localStorage.getItem(connectedPeerIdsLocalStorageProperties.key) ??
      connectedPeerIdsLocalStorageProperties.defaultValue
  );
}

export function getConnectedPeerIdsOnLastSession(peerId: string) {
  const connectedPeerIdsOnLastSession = loadConnectedPeerIdsOnLastSession();

  return connectedPeerIdsOnLastSession[peerId] ?? [];
}

export function saveConnectedPeerIdsOnLastSession(peerId: string, peerIds: string[]) {
  const connectedPeerIdsOnLastSession = loadConnectedPeerIdsOnLastSession();

  connectedPeerIdsOnLastSession[peerId] = peerIds;

  window.localStorage.setItem(
    connectedPeerIdsLocalStorageProperties.key,
    JSON.stringify(connectedPeerIdsOnLastSession)
  );
}

export function clearConnectedPeerIdsOnLastSession() {
  window.localStorage.setItem(
    connectedPeerIdsLocalStorageProperties.key,
    connectedPeerIdsLocalStorageProperties.defaultValue
  );
}

export function destroyPeer() {
  getPeer()?.destroy();
}

export function instantiatePeer(withEmptyId = false) {
  destroyPeer();

  const lastUsedId =
    window.localStorage.getItem(lastUsedPeerIdLocalStorageProperties.key) ??
    lastUsedPeerIdLocalStorageProperties.defaultValue;

  let peerOptions: PeerJSOption | undefined;

  if (process.env.NODE_ENV === "development") {
    const [parcelServer, peerServer] = gitpodConfiguration.ports;
    const parcelServerPort = parcelServer.port;
    const peerServerPort = peerServer.port;
    const { protocol, hostname } = window.location;
    const isGitpodEnvironment = protocol === "https:" && hostname.startsWith(`${parcelServerPort}-`);

    if (isGitpodEnvironment) {
      peerOptions = {
        host: hostname.replace(parcelServerPort.toString(), peerServerPort.toString()),
        port: 443,
        debug: PeerLogLevel.Warnings,
      };
    } else {
      peerOptions = {
        host: hostname,
        port: peerServerPort,
        debug: PeerLogLevel.Warnings,
      };
    }
  }

  const newPeer = new Peer(withEmptyId ? "" : lastUsedId, peerOptions);

  newPeer.on("open", (id) => {
    window.localStorage.setItem(lastUsedPeerIdLocalStorageProperties.key, id);
    emitPeerChanged(newPeer);
  });
  newPeer.on("close", () => emitPeerChanged(null));
  newPeer.on("error", (error) => {
    if ("type" in error && error.type === PeerErrorType.UnavailableID) {
      instantiatePeer(true);
    }
  });
}

export function handleConnectionWithPeer(connectionWithPeer: DataConnection) {
  let pingCheckerInterval = 0;

  connectionWithPeer.on("open", () => {
    const peerConnections = getPeerConnections();

    const existingConnection = peerConnections.find(
      (existingConnection) => existingConnection.peer === connectionWithPeer.peer
    );

    setPeerConnections((peerConnections) => {
      peerConnections.push(connectionWithPeer);
    });

    existingConnection?.close();

    pingCheckerInterval = window.setInterval(() => {
      connectionWithPeer.send({ method: RpcMethod.Ping } as PeerData);

      if (Date.now() - connectionWithPeer.metadata.lastPingTimestamp > PeerConnectionTimeoutInMilliseconds) {
        connectionWithPeer.close();
      }
    }, PingIntervalInMilliseconds);
  });

  connectionWithPeer.on("close", () => {
    setPeerConnections((peerConnections) => peerConnections.filter((connection) => connection !== connectionWithPeer));

    if (pingCheckerInterval) window.clearInterval(pingCheckerInterval);
  });

  connectionWithPeer.on("error", emitPeerError);

  connectionWithPeer.on("data", (data) => setConnectionDataReceived({ connection: connectionWithPeer, data }));
}

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
