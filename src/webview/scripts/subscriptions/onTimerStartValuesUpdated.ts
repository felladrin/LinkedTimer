import { getPeerConnections } from "../constants/peer";
import { sendEditTimerToPeerConnection } from "../commands/sendEditTimerToPeerConnection";
import { handleTimerStartValueUpdated, onTimerStartValuesUpdated } from "../constants/timer";

onTimerStartValuesUpdated((timerStartValues) => {
  handleTimerStartValueUpdated(timerStartValues);
  getPeerConnections().forEach(sendEditTimerToPeerConnection);
});
