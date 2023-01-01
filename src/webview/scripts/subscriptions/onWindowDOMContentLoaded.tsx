import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { instantiatePeer } from "../commands/instantiatePeer";
import { Root } from "../components/Root";
import { isRunningInDevEnvironment } from "../constants/booleans";

window.addEventListener(
  "DOMContentLoaded",
  () => {
    if (isRunningInDevEnvironment) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const VConsole = require("vconsole");
      new VConsole({ theme: "dark" });
    }

    instantiatePeer();

    createRoot(document.body.appendChild(document.createElement("div"))).render(
      <StrictMode>
        <Root />
      </StrictMode>
    );
  },
  { once: true }
);
