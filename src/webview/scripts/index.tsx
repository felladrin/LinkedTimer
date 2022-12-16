import { createRoot } from "react-dom/client";
import { CurrentScreen } from "./enumerations";
import { currentScreenPubSub, timerIdToJoinPubSub } from "./constants";
import { Root } from "./components/Root/Root";

window.addEventListener("DOMContentLoaded", () => {
  if (location.pathname.startsWith("/join/")) {
    const [setCurrentScreen] = currentScreenPubSub;
    const [setTimerIdToJoin] = timerIdToJoinPubSub;
    setTimerIdToJoin(location.pathname.substring("/join/".length));
    setCurrentScreen(CurrentScreen.JoinScreen);
  }
  const root = document.createElement("div");
  root.classList.add("page-wrapper");
  document.body.appendChild(root);
  createRoot(root).render(<Root />);
}, { once: true });
