import {
  emitInitialSync,
  listenToEditTimer,
  listenToInitialSync,
  listenToPeriodicSync,
  onRoomUpdated,
  listenToStart,
  listenToStop,
  getRoom,
} from "../constants/room";
import {
  getTimerStartValues,
  getTimerValues,
  getTotalTimerSeconds,
  isTimerRunning,
  publishTimerStartValues,
  startTimer,
  startTimerWithValues,
  stopTimer,
} from "../constants/timer";
import { HoursMinutesSeconds, InitialSyncParameters, PeriodicSyncParameters } from "../types";

onRoomUpdated((room) => {
  if (!room) return;

  window.location.hash = `#${room.id}`;

  listenToEditTimer(handleEditTimerEvent);
  listenToStart(startTimer);
  listenToStop(stopTimer);
  listenToPeriodicSync(handlePeriodicSyncEvent);
  listenToInitialSync(handleInitialSyncEvent);

  room.onPeerJoined((peerId) => {
    emitInitialSync(
      {
        isRunning: isTimerRunning(),
        timeValues: getTimerValues(),
        totalSeconds: getTotalTimerSeconds(),
        timerEditorConfiguration: getTimerStartValues(),
        joinRoomTimestamp: room.creationTimestamp,
      },
      [peerId]
    );
  });
});

// Shared older-peer rule for both sync handlers: a peer that joined the room later never gets to move
// the earlier peers' state. Peers on versions predating the joinRoomTimestamp field send no timestamp,
// and a missing timestamp never compares greater, so their syncs are applied exactly as before.
function isReceivingThisEventFromAPeerThatJoinedLater(joinRoomTimestamp: number | undefined): boolean {
  return joinRoomTimestamp !== undefined && joinRoomTimestamp > (getRoom()?.creationTimestamp ?? 0);
}

function handlePeriodicSyncEvent(data: PeriodicSyncParameters): void {
  const { isRunning, timeValues, totalSeconds, joinRoomTimestamp } = data;

  if (isReceivingThisEventFromAPeerThatJoinedLater(joinRoomTimestamp)) return;

  // The !isRunning branch must stay inert: startTimerWithValues stops before starting, so every sync-triggered
  // restart broadcasts a transient { isRunning: false, totalSeconds: 0 } frame of its own. Acting on a peer's
  // reported stop here would echo every restart back as a room-wide stop cascade.

  // Deliberate consequence of the guard: between two peers that both send a join timestamp, drift
  // correction is one-directional down the join order: the earliest peer becomes the sole drift
  // authority. A throttled tab that joined earliest keeps broadcasting its lagging seconds and
  // repeatedly resets later peers to its clock, with nothing pushing back; before this guard,
  // correction was mutual. Accepted per #1203, which asked for the same rule as
  // handleInitialSyncEvent, not a start-only variant.
  if (isRunning && Math.abs(totalSeconds - getTotalTimerSeconds()) > 1) {
    startTimerWithValues(timeValues);
  }
}

function handleEditTimerEvent(data: HoursMinutesSeconds) {
  const timerStartValues = getTimerStartValues();
  const expected = data;
  if (
    timerStartValues.hours !== expected.hours ||
    timerStartValues.minutes !== expected.minutes ||
    timerStartValues.seconds !== expected.seconds
  ) {
    publishTimerStartValues(expected);
  }
}

function handleInitialSyncEvent(data: InitialSyncParameters): void {
  const { isRunning, timeValues, totalSeconds, timerEditorConfiguration, joinRoomTimestamp } = data;

  if (isReceivingThisEventFromAPeerThatJoinedLater(joinRoomTimestamp)) return;

  // A stopped timer adopts the peer's state regardless of the drift tolerance. handlePeriodicSyncEvent keeps
  // the tolerance because it debounces syncs still in flight when someone presses Stop, a race this one-shot
  // join handshake does not face in practice, so the two conditions are intentionally different.
  if (isRunning && (!isTimerRunning() || Math.abs(totalSeconds - getTotalTimerSeconds()) > 1)) {
    startTimerWithValues(timeValues);
  } else if (!isRunning && isTimerRunning()) {
    stopTimer();
  }

  const timerStartValues = getTimerStartValues();
  if (
    timerStartValues.hours !== timerEditorConfiguration.hours ||
    timerStartValues.minutes !== timerEditorConfiguration.minutes ||
    timerStartValues.seconds !== timerEditorConfiguration.seconds
  ) {
    publishTimerStartValues(timerEditorConfiguration);
  }
}
