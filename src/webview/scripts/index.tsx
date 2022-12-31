import { createRoot } from "react-dom/client";
import { Root } from "./elements/Root";
import { StrictMode } from "react";
import { isRunningInDevEnvironment } from "./controllers/appController";
import "./controllers/*.ts";

if (isRunningInDevEnvironment) require("./devModules");

window.addEventListener(
  "DOMContentLoaded",
  () =>
    createRoot(document.body.appendChild(document.createElement("div"))).render(
      <StrictMode>
        <Root />
      </StrictMode>
    ),
  { once: true }
);
