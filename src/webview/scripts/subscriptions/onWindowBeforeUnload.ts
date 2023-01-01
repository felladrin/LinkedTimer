import { destroyPeer } from "../commands/destroyPeer";

window.addEventListener(
  "beforeunload",
  () => {
    destroyPeer();
  },
  { once: true }
);
