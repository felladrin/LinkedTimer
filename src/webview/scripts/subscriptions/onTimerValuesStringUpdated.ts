import { onTimerValuesStringUpdated } from "../constants/timer";
import { displayName } from "../../../../package.json";
import { vsCodeApi } from "../constants/vsCodeApi";

onTimerValuesStringUpdated((timerValuesString) => {
  let title = `${timerValuesString} | ${displayName}`;

  if (timerValuesString === "00:00:00") title = displayName;

  window.document.title = title;

  vsCodeApi.postMessage({ panelTitle: title });
});
