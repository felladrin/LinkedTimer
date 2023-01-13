import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { connectToRoom, tryGettingRoomFromHash } from "../constants/room";
import { Root } from "../components/Root";
import { selfId } from "trystero";
import VConsole from "vconsole";

window.addEventListener(
  "DOMContentLoaded",
  () => {
    if (process.env.NODE_ENV === "development") new VConsole({ theme: "dark" });

    connectToRoom(tryGettingRoomFromHash() ?? selfId);

    createRoot(document.body.appendChild(document.createElement("div"))).render(
      <StrictMode>
        <Root />
      </StrictMode>
    );
  },
  { once: true }
);
