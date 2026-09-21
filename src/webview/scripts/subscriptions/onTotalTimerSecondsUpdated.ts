import { emitPeriodicSync, getRoom } from "../constants/room";
import { getTimerValues, getTotalTimerSeconds, isTimerRunning, onTotalTimerSecondsUpdated } from "../constants/timer";

onTotalTimerSecondsUpdated(() => {
  emitPeriodicSync({
    isRunning: isTimerRunning(),
    timeValues: getTimerValues(),
    totalSeconds: getTotalTimerSeconds(),
    joinRoomTimestamp: getRoom()?.creationTimestamp ?? 0,
  });
});
