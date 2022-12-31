import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createPeer } from "../commands/createPeer";
import { Root } from "../components/Root";
import { isRunningInDevEnvironment } from "../constants/booleans";

window.addEventListener(
  "DOMContentLoaded",
  () => {
    if (isRunningInDevEnvironment) require("../modules/vconsole");

    createPeer();

    createRoot(document.body.appendChild(document.createElement("div"))).render(
      <StrictMode>
        <Root />
      </StrictMode>
    );
  },
  { once: true }
);
