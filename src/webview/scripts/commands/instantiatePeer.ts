import Peer, { PeerJSOption, util } from "peerjs";
import { isRunningInDevEnvironment } from "../constants/booleans";
import { emitPeerChanged } from "../constants/peer";
import { LogLevel } from "../enumerations/LogLevel";
import { destroyPeer } from "./destroyPeer";

export function instantiatePeer() {
  destroyPeer();

  const peerOptions = {
    host: isRunningInDevEnvironment ? window.location.hostname : util.CLOUD_HOST,
    port: isRunningInDevEnvironment ? 9000 : util.CLOUD_PORT,
    debug: isRunningInDevEnvironment ? LogLevel.Warnings : LogLevel.Disabled,
  } as PeerJSOption;

  const newPeer = new Peer("", peerOptions);

  newPeer.on("open", () => emitPeerChanged(newPeer));
  newPeer.on("close", () => emitPeerChanged(null));
}
