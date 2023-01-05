import Peer, { PeerJSOption } from "peerjs";
import { emitPeerChanged, lastUsedPeerIdLocalStorageProperties } from "../constants/peer";
import { PeerLogLevel } from "../enumerations/PeerLogLevel";
import { PeerErrorType } from "../enumerations/PeerErrorType";
import { destroyPeer } from "./destroyPeer";
// @ts-expect-error - Parcel supports importing YAML files (https://parceljs.org/languages/yaml)
import gitpodConfiguration from "../../../../.gitpod.yml";

export function instantiatePeer(withEmptyId = false) {
  destroyPeer();

  const lastUsedId =
    window.localStorage.getItem(lastUsedPeerIdLocalStorageProperties.key) ??
    lastUsedPeerIdLocalStorageProperties.defaultValue;

  let peerOptions: PeerJSOption | undefined;

  if (process.env.NODE_ENV === "development") {
    const [parcelServer, peerServer] = gitpodConfiguration.ports;
    const parcelServerPort = parcelServer.port;
    const peerServerPort = peerServer.port;
    const { protocol, hostname } = window.location;
    const isGitpodEnvironment = protocol === "https:" && hostname.startsWith(`${parcelServerPort}-`);

    if (isGitpodEnvironment) {
      peerOptions = {
        host: hostname.replace(parcelServerPort.toString(), peerServerPort.toString()),
        port: 443,
        debug: PeerLogLevel.Warnings,
      };
    } else {
      peerOptions = {
        host: hostname,
        port: peerServerPort,
        debug: PeerLogLevel.Warnings,
      };
    }
  }

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
