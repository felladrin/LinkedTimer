import { onTimerValuesStringUpdated } from "../constants/timer";
import { appName } from "../constants/strings";
import { vsCodeApi } from "../constants/vsCodeApi";

onTimerValuesStringUpdated((timerValuesString) => {
  window.document.title = `${timerValuesString} | ${appName}`;

  vsCodeApi.postMessage({ panelTitle: timerValuesString });
});
