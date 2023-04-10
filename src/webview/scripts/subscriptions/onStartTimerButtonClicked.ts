import { emitStart } from "../constants/room";
import { onStartTimerButtonClicked, startTimer } from "../constants/timer";

onStartTimerButtonClicked(() => {
  startTimer();
  emitStart();
});
