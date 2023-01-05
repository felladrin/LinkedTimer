import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { instantiatePeer } from "../constants/peer";
import { Root } from "../components/Root";
import VConsole from "vconsole";

window.addEventListener(
  "DOMContentLoaded",
  () => {
    if (process.env.NODE_ENV === "development") new VConsole({ theme: "dark" });

    instantiatePeer();

    createRoot(document.body.appendChild(document.createElement("div"))).render(
      <StrictMode>
        <Root />
      </StrictMode>
    );
  },
  { once: true }
);
