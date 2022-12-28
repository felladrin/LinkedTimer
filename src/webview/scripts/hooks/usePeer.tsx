import Peer, { DataConnection, PeerJSOption, util } from "peerjs";
import { useEffect, useState } from "react";
import { isRunningInDevEnvironment, PeerState } from "../constants";

enum PeerErrorType {
  BrowserIncompatible = "browser-incompatible",
  Disconnected = "disconnected",
  InvalidID = "invalid-id",
  InvalidKey = "invalid-key",
  Network = "network",
  PeerUnavailable = "peer-unavailable",
  SslUnavailable = "ssl-unavailable",
  ServerError = "server-error",
  SocketError = "socket-error",
  SocketClosed = "socket-closed",
  UnavailableID = "unavailable-id",
  WebRTC = "webrtc",
}

enum LogLevel {
  Disabled = 0,
  Errors = 1,
  Warnings = 2,
  All = 3,
}

export function usePeer() {
  const peerOptions = {
    host: isRunningInDevEnvironment ? location.hostname : util.CLOUD_HOST,
    port: isRunningInDevEnvironment ? 9000 : util.CLOUD_PORT,
    debug: isRunningInDevEnvironment ? LogLevel.Warnings : LogLevel.Disabled,
  } as PeerJSOption;

  const [peer, setPeer] = useState(new Peer("", peerOptions));
  const [isPeerOpen, setPeerOpen] = useState(false);
  const [peerConnections, setPeerConnections] = useState<DataConnection[]>([]);

  const connectToPeer = (requestedPeerIdToConnect: string) => {
    if (requestedPeerIdToConnect.trim().length === 0 || !peer) return;

    const connectionWithPeer = peer.connect(requestedPeerIdToConnect);

    setPeerConnections([...peerConnections, connectionWithPeer]);

    connectionWithPeer.on("close", () => {
      setPeerConnections(peerConnections.filter((connection) => connection !== connectionWithPeer));
    });
  };

  useEffect(() => {
    const handleConnectionOpen = () => setPeerOpen(true);
    const handleConnectionClose = () => setPeerOpen(false);
    const handleDisconnection = () => {
      peer.reconnect();
    };
    const handleError = (error: unknown) => {
      if ((error as { type: PeerErrorType }).type === PeerErrorType.UnavailableID) {
        peer.destroy();
        setPeer(new Peer("", peerOptions));
      }
    };

    peer.on("open", handleConnectionOpen);
    peer.on("close", handleConnectionClose);
    peer.on("disconnected", handleDisconnection);
    peer.on("error", handleError);

    return () => {
      peer.off("open", handleConnectionOpen);
      peer.off("close", handleConnectionClose);
      peer.off("disconnected", handleDisconnection);
      peer.off("error", handleError);
    };
  }, [peer]);

  useEffect(() => {
    const handleConnectionWithPeer = (connectionWithPeer: DataConnection) => {
      setPeerConnections([...peerConnections, connectionWithPeer]);

      connectionWithPeer.on("close", () => {
        setPeerConnections(peerConnections.filter((connection) => connection !== connectionWithPeer));
      });
    };

    peer.on("connection", handleConnectionWithPeer);

    return () => {
      peer.off("connection", handleConnectionWithPeer);
    };
  }, [peer, peerConnections]);

  return [peer, isPeerOpen, peerConnections, connectToPeer] as PeerState;
}
