import { listenToTimerTargetAchieved, listenToTimerValuesString } from "./timerController";
import { appName } from "./appController";

listenToTimerTargetAchieved(() => {
  const title = `Time's up! | ${appName}`;
  window.document.title = title;
});

listenToTimerValuesString((timerValuesString) => {
  window.document.title = `${timerValuesString} | ${appName}`;
});
