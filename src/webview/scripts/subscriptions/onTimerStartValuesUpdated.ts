import { getPeerConnections } from "../constants/peer";
import { sendEditTimerToPeerConnection } from "../commands/sendEditTimerToPeerConnection";
import { onTimerStartValuesUpdated } from "../constants/timer";

onTimerStartValuesUpdated(() => {
  getPeerConnections().forEach(sendEditTimerToPeerConnection);
});
