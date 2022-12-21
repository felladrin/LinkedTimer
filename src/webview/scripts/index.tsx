import { createRoot } from "react-dom/client";
import { Root } from "./components/Root";

window.addEventListener(
  "DOMContentLoaded",
  () => {
    const root = document.createElement("div");
    root.classList.add("page-wrapper");
    document.body.appendChild(root);
    createRoot(root).render(<Root />);
  },
  { once: true }
);
