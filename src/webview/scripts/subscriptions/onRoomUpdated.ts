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

  if (isRunning && Math.abs(totalSeconds - getTotalTimerSeconds()) > 1) {
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
