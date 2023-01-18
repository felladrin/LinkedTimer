import { createPubSub } from "create-pubsub";
import { ActionReceiver, ActionSender, joinRoom, Room, selfId } from "trystero";
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

export const roomIdPubSub = createPubSub(tryGettingRoomFromHash() ?? selfId);
const [setRoomId, onRoomIdUpdated, getRoomId] = roomIdPubSub;
export { onRoomIdUpdated, getRoomId };

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

  setRoomId(roomId);
  setJoinRoomTimestamp(Date.now());

  let room: Room;

  try {
    room = joinRoom({ appId }, roomId);
  } catch {
    window.setTimeout(() => connectToRoom(roomId), 1000);
    return;
  }

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

function tryGettingRoomFromHash() {
  const { hash } = window.location;

  if (hash.startsWith("#") && hash.length > 1) return hash.replace("#", "");

  return null;
}
