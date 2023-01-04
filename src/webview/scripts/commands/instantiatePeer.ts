import Peer, { PeerJSOption } from "peerjs";
import { emitPeerChanged, lastUsedPeerIdLocalStorageProperties } from "../constants/peer";
import { PeerLogLevel } from "../enumerations/PeerLogLevel";
import { PeerErrorType } from "../enumerations/PeerErrorType";
import { destroyPeer } from "./destroyPeer";

export function instantiatePeer(withEmptyId = false) {
  destroyPeer();

  const lastUsedId =
    window.localStorage.getItem(lastUsedPeerIdLocalStorageProperties.key) ??
    lastUsedPeerIdLocalStorageProperties.defaultValue;

  const newPeer = new Peer(
    withEmptyId ? "" : lastUsedId,
    process.env.NODE_ENV === "development"
      ? ({
          host: window.location.hostname,
          port: 9000,
          debug: PeerLogLevel.Warnings,
        } as PeerJSOption)
      : undefined
  );

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
