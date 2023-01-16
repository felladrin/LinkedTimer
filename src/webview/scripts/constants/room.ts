import { createPubSub } from "create-pubsub";
import { ActionReceiver, ActionSender, joinRoom, Room } from "trystero";
import { HoursMinutesSeconds } from "../types/HoursMinutesSeconds";
import { PeriodicSyncParameters } from "../types/PeriodicSyncParameters";
import { InitialSyncParameters } from "../types/InitialSyncParameters";
import { name as appId } from "../../../../package.json";

enum RoomActionName {
  Start = "Start",
  Stop = "Stop",
  PeriodicSync = "PeriodicSync",
  InitialSync = "InitialSync",
  EditTimer = "EditTimer",
}

export const roomIdPubSub = createPubSub("Obtaining ID...");
const [setRoomId, onRoomIdUpdated] = roomIdPubSub;
export { onRoomIdUpdated };

const [setJoinRoomTimestamp, , getJoinRoomTimestamp] = createPubSub(Date.now());
export { getJoinRoomTimestamp };

const [setRoom, onRoomChanged, getRoom] = createPubSub<Room | null>(null);
export { onRoomChanged };

export const roomPeersPubSub = createPubSub<string[]>([]);

export let broadcastEditTimerAction: ActionSender<HoursMinutesSeconds>;
export let onEditTimerActionReceived: ActionReceiver<HoursMinutesSeconds>;
export let broadcastStartAction: ActionSender<null>;
export let onStartActionReceived: ActionReceiver<null>;
export let broadcastStopAction: ActionSender<null>;
export let onStopActionReceived: ActionReceiver<null>;
export let broadcastPeriodicSyncAction: ActionSender<PeriodicSyncParameters>;
export let onPeriodicSyncActionReceived: ActionReceiver<PeriodicSyncParameters>;
export let broadcastInitialSyncAction: ActionSender<InitialSyncParameters>;
export let onInitialSyncActionReceived: ActionReceiver<InitialSyncParameters>;

export function leaveRoom() {
  getRoom()?.leave();
}

export function connectToRoom(roomId: string) {
  leaveRoom();

  const room = joinRoom({ appId }, roomId);

  setRoomId(roomId);
  setJoinRoomTimestamp(Date.now());

  [broadcastEditTimerAction, onEditTimerActionReceived] = room.makeAction<HoursMinutesSeconds>(
    RoomActionName.EditTimer
  );
  [broadcastStartAction, onStartActionReceived] = room.makeAction<null>(RoomActionName.Start);
  [broadcastStopAction, onStopActionReceived] = room.makeAction<null>(RoomActionName.Stop);
  [broadcastPeriodicSyncAction, onPeriodicSyncActionReceived] = room.makeAction<PeriodicSyncParameters>(
    RoomActionName.PeriodicSync
  );
  [broadcastInitialSyncAction, onInitialSyncActionReceived] = room.makeAction<InitialSyncParameters>(
    RoomActionName.InitialSync
  );

  setRoom(room);
}

export function updateRoomPeers(room: Room) {
  const [setRoomPeers] = roomPeersPubSub;
  setRoomPeers(room.getPeers());
}

export function tryGettingRoomFromHash() {
  const { hash } = window.location;

  if (hash.startsWith("#") && hash.length > 1) return hash.replace("#", "");

  return null;
}
