import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { connectToRoom, getRoom } from "../constants/room";
import { Root } from "../components/Root";
import { configureTimerEventHandlers } from "../constants/timer";
import VConsole from "vconsole";

window.addEventListener(
  "DOMContentLoaded",
  () => {
    if (process.env.NODE_ENV === "development") new VConsole({ theme: "dark" });

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
