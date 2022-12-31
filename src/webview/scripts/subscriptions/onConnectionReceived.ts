import { onConnectionReceived } from "../constants/peer";
import { sendEditTimerToPeerConnection } from "../commands/sendEditTimerToPeerConnection";
import { sendSyncTimerToPeerConnection } from "../commands/sendSyncTimerToPeerConnection";
import { timer } from "../constants/timer";

onConnectionReceived(timer.isRunning() ? sendSyncTimerToPeerConnection : sendEditTimerToPeerConnection);
