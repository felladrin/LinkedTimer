import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { connectToRoom, getRoom } from "../constants/room";
import { Root } from "../components/Root";
import { configureTimerEventHandlers } from "../constants/timer";
import loadScript from "load-script";

window.addEventListener(
  "DOMContentLoaded",
  () => {
    if (/plugin=eruda/.test(window.location.search)) {
      loadScript("//cdn.jsdelivr.net/npm/eruda", () => {
        if ("eruda" in window) (window.eruda as { init: () => void }).init();
      });
    }

    configureTimerEventHandlers();

    connectToRoom(getRoom().id);

    createRoot(document.body.appendChild(document.createElement("div"))).render(
      <StrictMode>
        <Root />
      </StrictMode>
    );
  },
  { once: true }
);
