import { getPeer } from "../constants/peer";

export function destroyPeer() {
  getPeer()?.destroy();
}
