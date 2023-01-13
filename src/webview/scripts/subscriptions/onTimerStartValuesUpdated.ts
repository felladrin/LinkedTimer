import { broadcastEditTimerAction } from "../constants/room";
import { getTimerStartValues, handleTimerStartValueUpdated, onTimerStartValuesUpdated } from "../constants/timer";

onTimerStartValuesUpdated((timerStartValues) => {
  handleTimerStartValueUpdated(timerStartValues);
  broadcastEditTimerAction(getTimerStartValues());
});
