import Peer, { PeerJSOption, util } from "peerjs";
import { isRunningInDevEnvironment } from "../constants/booleans";
import { emitPeerChanged, lastUsedPeerIdLocalStorageProperties } from "../constants/peer";
import { PeerLogLevel } from "../enumerations/PeerLogLevel";
import { PeerErrorType } from "../enumerations/PeerErrorType";
import { destroyPeer } from "./destroyPeer";

export function instantiatePeer(withEmptyId = false) {
  destroyPeer();

  const peerOptions = {
    host: isRunningInDevEnvironment ? window.location.hostname : util.CLOUD_HOST,
    port: isRunningInDevEnvironment ? 9000 : util.CLOUD_PORT,
    debug: isRunningInDevEnvironment ? PeerLogLevel.Warnings : PeerLogLevel.Disabled,
  } as PeerJSOption;

  const lastUsedId =
    window.localStorage.getItem(lastUsedPeerIdLocalStorageProperties.key) ??
    lastUsedPeerIdLocalStorageProperties.defaultValue;

  const newPeer = new Peer(withEmptyId ? "" : lastUsedId, peerOptions);

  newPeer.on("open", (id) => {
    window.localStorage.setItem(lastUsedPeerIdLocalStorageProperties.key, id);
    emitPeerChanged(newPeer);
  });
  newPeer.on("close", () => emitPeerChanged(null));
  newPeer.on("error", (error) => {
    if ("type" in error && error.type === PeerErrorType.UnavailableID) {
      instantiatePeer(true);
    }
  });
}
