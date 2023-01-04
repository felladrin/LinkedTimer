import { onTimerTargetAchieved } from "../constants/timer";
import { displayName } from "../../../../package.json";
import { vsCodeApi } from "../constants/vsCodeApi";

const title = `Time's up! | ${displayName}`;

onTimerTargetAchieved(() => {
  window.document.title = title;

  vsCodeApi.postMessage({ informationMessage: `${displayName}: Time's up!` });

  vsCodeApi.postMessage({ panelTitle: title });
});
