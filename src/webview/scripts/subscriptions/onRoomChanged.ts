import {
  onEditTimerActionReceived,
  onStartActionReceived,
  onStopActionReceived,
  onPeriodicSyncActionReceived,
  onRoomChanged,
  updateRoomPeers,
  broadcastInitialSyncAction,
  getJoinRoomTimestamp,
  onInitialSyncActionReceived,
} from "../constants/room";
import { getTimerValues, isTimerRunning, startTimer, stopTimer } from "../constants/timer";
import { HoursMinutesSeconds } from "../types/HoursMinutesSeconds";
import { getTimerStartValues, publishTimerStartValues } from "../constants/timer";
import { PeriodicSyncParameters } from "../types/PeriodicSyncParameters";
import { getTotalTimerSeconds, startTimerWithValues } from "../constants/timer";
import { InitialSyncParameters } from "../types/InitialSyncParameters";

onRoomChanged((room) => {
  if (!room) return;

  onEditTimerActionReceived(handleEditTimerActionReceived);
  onStartActionReceived(startTimer);
  onStopActionReceived(stopTimer);
  onPeriodicSyncActionReceived(handlePeriodicSyncActionReceived);
  onInitialSyncActionReceived(handleInitialSyncActionReceived);

  room.onPeerJoin((peerId) => {
    updateRoomPeers(room);

    broadcastInitialSyncAction(
      {
        isRunning: isTimerRunning(),
        timeValues: getTimerValues(),
        totalSeconds: getTotalTimerSeconds(),
        timerEditorConfiguration: getTimerStartValues(),
        joinRoomTimestamp: getJoinRoomTimestamp(),
      },
      peerId
    );
  });

  room.onPeerLeave(() => updateRoomPeers(room));
});

function handlePeriodicSyncActionReceived(data: PeriodicSyncParameters): void {
  const { isRunning, timeValues, totalSeconds } = data;
  if (isRunning && Math.abs(totalSeconds - getTotalTimerSeconds()) > 1) {
    startTimerWithValues(timeValues);
  }
}

function handleEditTimerActionReceived(data: HoursMinutesSeconds) {
  const current = getTimerStartValues();
  const expected = data;
  if (
    current.hours !== expected.hours ||
    current.minutes !== expected.minutes ||
    current.seconds !== expected.seconds
  ) {
    publishTimerStartValues(() => expected);
  }
}

function handleInitialSyncActionReceived(data: InitialSyncParameters): void {
  const { isRunning, timeValues, totalSeconds, timerEditorConfiguration, joinRoomTimestamp } = data;

  const isReceivingActionFromAPeerThatJoinedLater = joinRoomTimestamp > getJoinRoomTimestamp();

  if (isReceivingActionFromAPeerThatJoinedLater) return;

  if (isRunning && Math.abs(totalSeconds - getTotalTimerSeconds()) > 1) {
    startTimerWithValues(timeValues);
  }

  const currentTimerStartValues = getTimerStartValues();
  if (
    currentTimerStartValues.hours !== timerEditorConfiguration.hours ||
    currentTimerStartValues.minutes !== timerEditorConfiguration.minutes ||
    currentTimerStartValues.seconds !== timerEditorConfiguration.seconds
  ) {
    publishTimerStartValues(() => timerEditorConfiguration);
  }
}
