import { emitStop } from "../constants/room";
import { onStopTimerButtonClicked, stopTimer } from "../constants/timer";

onStopTimerButtonClicked(() => {
  stopTimer();
  emitStop();
});
