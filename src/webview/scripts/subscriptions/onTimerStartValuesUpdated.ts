import { broadcastEditTimerAction } from "../constants/room";
import { saveTimerStartValuesToLocalStorage, onTimerStartValuesUpdated } from "../constants/timer";

onTimerStartValuesUpdated((timerStartValues) => {
  saveTimerStartValuesToLocalStorage(timerStartValues);
  broadcastEditTimerAction(timerStartValues);
});
