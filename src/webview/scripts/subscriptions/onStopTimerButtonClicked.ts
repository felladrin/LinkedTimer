import { broadcastStopAction } from "../constants/room";
import { onStopTimerButtonClicked, stopTimer } from "../constants/timer";

onStopTimerButtonClicked(() => {
  stopTimer();
  broadcastStopAction(null);
});
