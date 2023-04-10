import { createPubSub } from "create-pubsub";
import P2PT, { type Peer } from "p2pt";
import { HoursMinutesSeconds, InitialSyncParameters, PeriodicSyncParameters } from "../types";

type RoomEventEmitter<T = void> = (data: T, targetPeersIds?: string[]) => Promise<void>;
type RoomEventHandler<T = void> = (data: T, peerId: string) => void;
type RoomEventListener<T = void> = (handler: RoomEventHandler<T>) => void;
type Room = ReturnType<typeof prepareRoom>;

function prepareRoom({
  id,
  trackersAnnounceURLs = ["wss://tracker.openwebtorrent.com", "wss://tracker.btorrent.xyz"],
}: {
  id?: string;
  trackersAnnounceURLs?: string[];
}) {
  const creationTimestamp = Date.now();

  const p2pt = new P2PT(trackersAnnounceURLs);

  const selfPeerId = p2pt._peerId;

  if (!id) id = selfPeerId;

  p2pt.setIdentifier(id);

  const onPeerJoined = (handler: (peerId: string) => void) => {
    p2pt.on("peerconnect", (peer) => handler(peer.id));
  };

  const onPeerLeft = (handler: (peerId: string) => void) => {
    p2pt.on("peerclose", (peer) => handler(peer.id));
  };

  let peers: Peer[] = [];

  p2pt.on("peerconnect", (peer) => peers.push(peer));

  onPeerLeft((peerId) => {
    peers = peers.filter((peer) => peer.id !== peerId);
  });

  const join = () => p2pt.start();

  const leave = () => p2pt.destroy();

  const registerEvent = <T = void>(eventName: string) => {
    const broadcast: RoomEventEmitter<T> = async (data: T, targetPeersIds?: string[]) => {
      const peersToBroadcastTo = Array.isArray(targetPeersIds)
        ? peers.filter((peer) => targetPeersIds.includes(peer.id))
        : peers;
      const promises = peersToBroadcastTo.map((peer) => p2pt.send(peer, [eventName, data]));
      await Promise.all(promises);
    };

    const eventHandlers: RoomEventHandler<T>[] = [];

    const onReceived: RoomEventListener<T> = (handler) => {
      eventHandlers.push(handler);
    };

    p2pt.on("msg", (peer, data) => {
      const [receivedEventName, payload] = data;
      if (receivedEventName === eventName) eventHandlers.forEach((handle) => handle(payload, peer.id));
    });

    return [broadcast, onReceived] as const;
  };

  const getPeersIds = () => peers.map((peer) => peer.id);

  return {
    id,
    selfPeerId,
    creationTimestamp,
    join,
    leave,
    registerEvent,
    getPeersIds,
    onPeerJoined,
    onPeerLeft,
  };
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

  const room = prepareRoom({ id: roomId });

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
