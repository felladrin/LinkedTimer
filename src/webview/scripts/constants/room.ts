import { createPubSub } from "create-pubsub";
import { ActionReceiver, ActionSender, joinRoom, Room, selfId } from "trystero";
import { name as appId } from "../../../../package.json";
import { HoursMinutesSeconds, InitialSyncParameters, PeriodicSyncParameters } from "../types";

enum RoomActionName {
  Start = "Start",
  Stop = "Stop",
  PeriodicSync = "PeriodicSync",
  InitialSync = "InitialSync",
  EditTimer = "EditTimer",
}

export const roomPubSub = createPubSub({
  instance: null as Room | null,
  id: tryGettingRoomFromHash() ?? selfId,
  joinTimestamp: Date.now(),
});
const [setRoom, onRoomUpdated, getRoom] = roomPubSub;
export { onRoomUpdated, getRoom };

export const roomPeersPubSub = createPubSub<ReturnType<Room["getPeers"]>>({});
const [setRoomPeers] = roomPeersPubSub;

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
  getRoom().instance?.leave();
}

export function connectToRoom(roomId: string) {
  leaveRoom();

  const room = joinRoom({ appId }, roomId);

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

  setRoom({
    instance: room,
    id: roomId,
    joinTimestamp: Date.now(),
  });
}

export function updateRoomPeers() {
  const { instance } = getRoom();
  if (instance) setRoomPeers(instance.getPeers());
}

function tryGettingRoomFromHash() {
  const { hash } = window.location;
  return hash.startsWith("#") && hash.length > 1 ? hash.replace("#", "") : null;
}
