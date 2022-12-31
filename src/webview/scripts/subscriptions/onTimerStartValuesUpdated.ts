import { getPeerConnections } from "../constants/peer";
import { sendEditTimerToPeerConnection } from "../commands/sendEditTimerToPeerConnection";
import { onTimerStartValuesUpdated, timerStartValuesLocalStorageProperties } from "../constants/timer";

onTimerStartValuesUpdated((timerStartValues) => {
  getPeerConnections().forEach(sendEditTimerToPeerConnection);

  window.localStorage.setItem(timerStartValuesLocalStorageProperties.key, JSON.stringify(timerStartValues));
});
