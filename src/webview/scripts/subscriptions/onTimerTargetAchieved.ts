import { onTimerTargetAchieved } from "../constants/timer";
import { appName } from "../constants/strings";
import { vsCodeApi } from "../constants/vsCodeApi";

const title = `Time's up! | ${appName}`;

onTimerTargetAchieved(() => {
  window.document.title = title;

  vsCodeApi.postMessage({ informationMessage: `${appName}: Time's up!` });

  vsCodeApi.postMessage({ panelTitle: title });
});
