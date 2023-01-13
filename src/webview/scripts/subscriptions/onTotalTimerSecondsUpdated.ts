import { broadcastPeriodicSyncAction } from "../constants/room";
import { getTimerValues, getTotalTimerSeconds, isTimerRunning, onTotalTimerSecondsUpdated } from "../constants/timer";

onTotalTimerSecondsUpdated(() => {
  broadcastPeriodicSyncAction({
    isRunning: isTimerRunning(),
    timeValues: getTimerValues(),
    totalSeconds: getTotalTimerSeconds(),
  });
});
