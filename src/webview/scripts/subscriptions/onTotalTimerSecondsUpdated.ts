import { getPeerConnections } from "../constants/peer";
import { sendSyncTimerToPeerConnection } from "../commands/sendSyncTimerToPeerConnection";
import { onTotalTimerSecondsUpdated } from "../constants/timer";

onTotalTimerSecondsUpdated(() => {
  getPeerConnections().forEach((peerConnection) => {
    sendSyncTimerToPeerConnection(peerConnection);
  });
});
