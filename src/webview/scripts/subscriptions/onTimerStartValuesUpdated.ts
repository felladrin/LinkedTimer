import { emitEditTimer } from "../constants/room";
import { saveTimerStartValuesToLocalStorage, onTimerStartValuesUpdated } from "../constants/timer";

onTimerStartValuesUpdated((timerStartValues) => {
  saveTimerStartValuesToLocalStorage(timerStartValues);
  emitEditTimer(timerStartValues);
});
