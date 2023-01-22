import { onTimerTargetAchieved } from "../constants/timer";
import { displayName } from "../../../../package.json";
import { vsCodeApi } from "../constants/vsCodeApi";

onTimerTargetAchieved(() => {
  const title = `Time's up! | ${displayName}`;

  window.document.title = title;

  vsCodeApi.postMessage({ panelTitle: title });

  vsCodeApi.postMessage({ informationMessage: `${displayName}: Time's up!` });
});
