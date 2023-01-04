import { onTimerValuesStringUpdated } from "../constants/timer";
import { displayName } from "../../../../package.json";
import { vsCodeApi } from "../constants/vsCodeApi";

onTimerValuesStringUpdated((timerValuesString) => {
  window.document.title = `${timerValuesString} | ${displayName}`;

  vsCodeApi.postMessage({ panelTitle: timerValuesString });
});
