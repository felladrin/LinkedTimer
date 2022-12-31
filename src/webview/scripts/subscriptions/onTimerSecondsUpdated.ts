import { getPeerConnections } from "../constants/peer";
import { sendSyncTimerToPeerConnection } from "../commands/sendSyncTimerToPeerConnection";
import {
  getTimerStartValues,
  onTimerSecondsUpdated,
  setPercentageOfTimeLeft,
  setTimerRunning,
  setTimerValuesString,
  timer,
} from "../constants/timer";

onTimerSecondsUpdated(() => {
  setTimerRunning(timer.isRunning());
  setTimerValuesString(timer.getTimeValues().toString());

  const { hours, minutes, seconds } = getTimerStartValues();
  setPercentageOfTimeLeft((timer.getTotalTimeValues().seconds / (hours * 3600 + minutes * 60 + seconds)) * 100);

  getPeerConnections().forEach((peerConnection) => {
    sendSyncTimerToPeerConnection(peerConnection);
  });
});
