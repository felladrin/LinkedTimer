import { broadcastStartAction } from "../constants/room";
import { onStartTimerButtonClicked, startTimer } from "../constants/timer";

onStartTimerButtonClicked(() => {
  startTimer();
  broadcastStartAction(null);
});
