import { createRoot } from "react-dom/client";
import { Root } from "./components/Root";
import { StrictMode } from "react";

window.addEventListener(
  "DOMContentLoaded",
  () => createRoot(
    document.body.appendChild(
      document.createElement("div")
    )
  ).render(<StrictMode><Root /></StrictMode>),
  { once: true }
);
