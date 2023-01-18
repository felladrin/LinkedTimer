import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { connectToRoom, getRoomId } from "../constants/room";
import { Root } from "../components/Root";
import IdleJs from "idle-js";
import VConsole from "vconsole";

window.addEventListener(
  "DOMContentLoaded",
  () => {
    if (process.env.NODE_ENV === "development") new VConsole({ theme: "dark" });

    const connect = () => connectToRoom(getRoomId());

    new IdleJs({
      idle: 10000,
      events: ["keypress", "mousemove", "touchmove", "click", "scroll"],
      onIdle: connect,
      onActive: connect,
      onHide: connect,
      onShow: connect,
      keepTracking: true,
      startAtIdle: false,
    }).start();

    connect();

    createRoot(document.body.appendChild(document.createElement("div"))).render(
      <StrictMode>
        <Root />
      </StrictMode>
    );
  },
  { once: true }
);
