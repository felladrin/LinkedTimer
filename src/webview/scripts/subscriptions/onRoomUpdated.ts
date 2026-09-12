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

function handlePeriodicSyncEvent(data: PeriodicSyncParameters): void {
  const { isRunning, timeValues, totalSeconds } = data;
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

  const isReceivingThisEventFromAPeerThatJoinedLater = joinRoomTimestamp > (getRoom()?.creationTimestamp ?? 0);

  if (isReceivingThisEventFromAPeerThatJoinedLater) return;

  // A stopped timer adopts the peer's state regardless of the drift tolerance. handlePeriodicSyncEvent keeps
  // the tolerance because it debounces syncs still in flight when someone presses Stop, a race this one-shot
  // join handshake does not face in practice, so the two conditions are intentionally different.
  if (isRunning && (!isTimerRunning() || Math.abs(totalSeconds - getTotalTimerSeconds()) > 1)) {
    startTimerWithValues(timeValues);
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
