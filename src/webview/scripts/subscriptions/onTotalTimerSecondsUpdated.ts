import { emitPeriodicSync } from "../constants/room";
import { getTimerValues, getTotalTimerSeconds, isTimerRunning, onTotalTimerSecondsUpdated } from "../constants/timer";

onTotalTimerSecondsUpdated(() => {
  emitPeriodicSync({
    isRunning: isTimerRunning(),
    timeValues: getTimerValues(),
    totalSeconds: getTotalTimerSeconds(),
  });
});
