import { destroyPeer } from "../constants/peer";

window.addEventListener("beforeunload", () => destroyPeer(), { once: true });
