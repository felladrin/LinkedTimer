import {
  broadcastInitialSyncAction,
  onEditTimerActionReceived,
  onInitialSyncActionReceived,
  onPeriodicSyncActionReceived,
  onRoomUpdated,
  onStartActionReceived,
  onStopActionReceived,
  updateRoomPeers,
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
  if (!room.instance) return;

  window.location.hash = `#${room.id}`;

  onEditTimerActionReceived(handleEditTimerActionReceived);
  onStartActionReceived(startTimer);
  onStopActionReceived(stopTimer);
  onPeriodicSyncActionReceived(handlePeriodicSyncActionReceived);
  onInitialSyncActionReceived(handleInitialSyncActionReceived);

  room.instance.onPeerJoin((peerId) => {
    updateRoomPeers();

    broadcastInitialSyncAction(
      {
        isRunning: isTimerRunning(),
        timeValues: getTimerValues(),
        totalSeconds: getTotalTimerSeconds(),
        timerEditorConfiguration: getTimerStartValues(),
        joinRoomTimestamp: room.joinTimestamp,
      },
      peerId
    );
  });

  room.instance.onPeerLeave(() => updateRoomPeers());
});

function handlePeriodicSyncActionReceived(data: PeriodicSyncParameters): void {
  const { isRunning, timeValues, totalSeconds } = data;
  if (isRunning && Math.abs(totalSeconds - getTotalTimerSeconds()) > 1) {
    startTimerWithValues(timeValues);
  }
}

function handleEditTimerActionReceived(data: HoursMinutesSeconds) {
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

function handleInitialSyncActionReceived(data: InitialSyncParameters): void {
  const { isRunning, timeValues, totalSeconds, timerEditorConfiguration, joinRoomTimestamp } = data;

  const isReceivingActionFromAPeerThatJoinedLater = joinRoomTimestamp > getRoom().joinTimestamp;

  if (isReceivingActionFromAPeerThatJoinedLater) return;

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
