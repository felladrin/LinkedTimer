import { createPubSub } from "create-pubsub";
import BitTorrentTrackerClient from "bittorrent-tracker/client";
import getSha1Hash from "tiny-hashes/sha1";
import getRandomElementFromArray from "random-item";
import changeCase from "camelcase";
import { name as packageName } from "../../../../package.json";
import { HoursMinutesSeconds, InitialSyncParameters, PeriodicSyncParameters } from "../types";
import { possiblePeerIdSuffixes } from "./strings";
// @ts-expect-error - Importing untyped module.
import adjectives from "../../../../node_modules/@faker-js/faker/dist/cjs/locales/en/word/adjective";
// @ts-expect-error - Importing untyped module.
import colorNames from "../../../../node_modules/@faker-js/faker/dist/cjs/locales/en/color/human";

type Peer = import("simple-peer").Instance & { id: string };
type RoomEventEmitter<T = void> = (data: T, targetPeersIds?: string[]) => Promise<void>;
type RoomEventHandler<T = void> = (data: T, peerId: string) => void;
type RoomEventListener<T = void> = (handler: RoomEventHandler<T>) => void;
type Room = ReturnType<typeof prepareRoom>;

function prepareRoom({
  id,
  peerId,
  trackersAnnounceURLs = ["wss://tracker.openwebtorrent.com"],
}: {
  id?: string;
  peerId?: string;
  trackersAnnounceURLs?: string[];
}) {
  const creationTimestamp = Date.now();

  const peerIdRequiredLength = 20;

  if (!peerId || peerId.length !== peerIdRequiredLength) {
    peerId = "";

    while (peerId.length < peerIdRequiredLength) {
      peerId = peerId.concat(Math.random().toString(36).substring(2));
    }

    peerId = peerId.substring(0, peerIdRequiredLength).toUpperCase();
  }

  if (!id) id = peerId;

  const [emitPeerConnected, onPeerJoined] = createPubSub<string>();
  const [emitPeerClosed, onPeerLeft] = createPubSub<string>();
  const [emitDataReceived, onDataReceived] = createPubSub<[Peer, string]>();

  const peers = new Map<string, Peer>();

  const client = new BitTorrentTrackerClient({
    peerId: Buffer.from(peerId),
    announce: trackersAnnounceURLs,
    infoHash: getSha1Hash(`${packageName}-${id}`),
  });

  client.on("peer", (peer: Peer) => {
    if (peers.has(peer.id)) {
      peer.destroy();
      return;
    }

    const onConnect = () => {
      const onMessage = (data: string) => emitDataReceived([peer, data]);

      const onClose = () => {
        peer.removeListener("data", onMessage);
        peer.removeListener("close", onClose);
        peer.removeListener("error", onClose);
        peer.removeListener("end", onClose);
        peer.destroy();
        peers.delete(peer.id);
        emitPeerClosed(peer.id);
        client.update();
      };

      peer.on("data", onMessage);
      peer.on("close", onClose);
      peer.on("error", onClose);
      peer.on("end", onClose);
      peers.set(peer.id, peer);
      emitPeerConnected(peer.id);
      client.update();
    };

    peer.connected ? onConnect() : peer.once("connect", onConnect);
  });

  let updateIntervalId = 0;

  const join = () => {
    client.start();
    updateIntervalId = window.setInterval(() => client.update(), 30 * 1000);
  };

  const leave = () => {
    window.clearInterval(updateIntervalId);
    client.stop();
    client.destroy();
    peers.forEach((peer) => peer.destroy());
    peers.clear();
  };

  const registerEvent = <T = void>(eventName: string) => {
    const broadcast: RoomEventEmitter<T> = async (data: T, targetPeersIds?: string[]) => {
      const peersArray = Array.from(peers.values());
      const peersToBroadcastTo = Array.isArray(targetPeersIds)
        ? peersArray.filter((peer) => targetPeersIds.includes(peer.id))
        : peersArray;
      const promises = peersToBroadcastTo.map((peer) => peer.send(JSON.stringify([eventName, data])));
      await Promise.all(promises);
    };

    const eventHandlers: RoomEventHandler<T>[] = [];

    const onReceived: RoomEventListener<T> = (handler) => {
      eventHandlers.push(handler);
    };

    onDataReceived(([peer, data]) => {
      const [receivedEventName, payload] = JSON.parse(data);
      if (receivedEventName === eventName) eventHandlers.forEach((handle) => handle(payload, peer.id));
    });

    return [broadcast, onReceived] as const;
  };

  const getPeersIds = () => Array.from(peers.keys());

  return {
    id,
    peerId,
    creationTimestamp,
    join,
    leave,
    registerEvent,
    getPeersIds,
    onPeerJoined,
    onPeerLeft,
  };
}

function generatePeerId() {
  let peerId = "";

  const peerIdRequiredLength = 20;

  while (peerId.length !== peerIdRequiredLength) {
    const randomColorName = getRandomElementFromArray<string>(colorNames);

    const idSuffix = getRandomElementFromArray(possiblePeerIdSuffixes);

    const fittingAdjectives = (adjectives as string[]).filter(
      (adjective) => adjective.length === peerIdRequiredLength - (randomColorName.length + idSuffix.length)
    );

    if (fittingAdjectives.length === 0) continue;

    peerId = changeCase([getRandomElementFromArray(fittingAdjectives), randomColorName, idSuffix], {
      pascalCase: true,
    });
  }

  return peerId;
}

enum RoomEventName {
  Start = "Start",
  Stop = "Stop",
  PeriodicSync = "PeriodicSync",
  InitialSync = "InitialSync",
  EditTimer = "EditTimer",
}

export const roomPubSub = createPubSub<Room | undefined>();

const [setRoom, onRoomUpdated, getRoom] = roomPubSub;
export { onRoomUpdated, getRoom };

export const roomPeersIdsPubSub = createPubSub<string[]>([]);
const [setRoomPeers] = roomPeersIdsPubSub;

export let emitEditTimer: RoomEventEmitter<HoursMinutesSeconds>;
export let listenToEditTimer: RoomEventListener<HoursMinutesSeconds>;
export let emitStart: RoomEventEmitter;
export let listenToStart: RoomEventListener;
export let emitStop: RoomEventEmitter;
export let listenToStop: RoomEventListener;
export let emitPeriodicSync: RoomEventEmitter<PeriodicSyncParameters>;
export let listenToPeriodicSync: RoomEventListener<PeriodicSyncParameters>;
export let emitInitialSync: RoomEventEmitter<InitialSyncParameters>;
export let listenToInitialSync: RoomEventListener<InitialSyncParameters>;

export function leaveRoom() {
  getRoom()?.leave();
}

export function connectToRoom(roomId?: string) {
  leaveRoom();

  const room = prepareRoom({ id: roomId, peerId: generatePeerId() });

  [emitEditTimer, listenToEditTimer] = room.registerEvent<HoursMinutesSeconds>(RoomEventName.EditTimer);
  [emitStart, listenToStart] = room.registerEvent(RoomEventName.Start);
  [emitStop, listenToStop] = room.registerEvent(RoomEventName.Stop);
  [emitPeriodicSync, listenToPeriodicSync] = room.registerEvent<PeriodicSyncParameters>(RoomEventName.PeriodicSync);
  [emitInitialSync, listenToInitialSync] = room.registerEvent<InitialSyncParameters>(RoomEventName.InitialSync);

  room.onPeerJoined(() => setRoomPeers(room.getPeersIds()));
  room.onPeerLeft(() => setRoomPeers(room.getPeersIds()));

  room.join();

  setRoom(room);
}

export function getRoomIdFromLocationHash() {
  const { hash } = window.location;
  if (hash.startsWith("#") && hash.length > 1) return hash.replace("#", "");
}
