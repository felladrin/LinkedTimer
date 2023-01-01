import { onConnectionReceived } from "../constants/peer";
import { sendEditTimerToPeerConnection } from "../commands/sendEditTimerToPeerConnection";
import { sendSyncTimerToPeerConnection } from "../commands/sendSyncTimerToPeerConnection";

onConnectionReceived((peerConnection) => {
  sendEditTimerToPeerConnection(peerConnection);
  sendSyncTimerToPeerConnection(peerConnection);
});
