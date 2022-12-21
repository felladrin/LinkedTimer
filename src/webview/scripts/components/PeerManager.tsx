import { useEffect } from "react";
import Peer, { DataConnection, PeerJSOption, util } from "peerjs";
import {
  connectionsPubSub,
  isRunningInDevEnvironment,
  peerPubSub,
  requestedPeerIdToConnectPubSub,
  timer,
  timerHoursPubSub,
  timerMinutesPubSub,
  timerSecondsPubSub
} from "../constants";
import { usePubSub } from "create-pubsub/react";
import { TimeCounter } from "easytimer.js";

enum RpcMethod {
  Start = "Start",
  Stop = "Stop",
  Sync = "Sync",
  EditTimer = "EditTimer",
}

type EditTimerNotification = {
  hours: string;
  minutes: string;
  seconds: string;
};

type SyncNotification = {
  timeValues: TimeCounter;
  totalSeconds: number;
};

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

const peerOptions = {
  host: isRunningInDevEnvironment ? location.hostname : util.CLOUD_HOST,
  port: isRunningInDevEnvironment ? 9000 : util.CLOUD_PORT,
  debug: isRunningInDevEnvironment ? LogLevel.Warnings : LogLevel.Disabled
} as PeerJSOption;

function createPeer() {
  const [setPeer] = peerPubSub;
  const [setConnections, , getConnections] = connectionsPubSub;

  let peer = new Peer("", peerOptions);

  const handlePeerOpened = () => {
    setPeer(peer);
  };
  peer.on("open", handlePeerOpened);

  const handlePeerClosed = () => {
    setPeer(null);
  };
  peer.on("close", handlePeerClosed);

  const handlePeerDisconnected = () => {
    peer.reconnect();
  };
  peer.on("disconnected", handlePeerDisconnected);

  const handleConnection = (connectionWithPeer: DataConnection) => {
    connectionWithPeer.on("open", () => {
      setConnections([...getConnections(), connectionWithPeer]);
    });
    connectionWithPeer.on("close", () => {
      setConnections(getConnections().filter((connection) => connection !== connectionWithPeer));
    });
  };
  peer.on("connection", handleConnection);

  peer.on("error", (error) => {
    if ((error as unknown as { type: PeerErrorType }).type === PeerErrorType.UnavailableID) {
      peer.destroy();
      peer = createPeer();
    }
  });

  return peer;
}

export function PeerManager() {
  const [peer] = usePubSub(peerPubSub);
  const [connections, setConnections] = usePubSub(connectionsPubSub);
  const [requestedPeerIdToConnect] = usePubSub(requestedPeerIdToConnectPubSub);

  useEffect(() => {
    let newPeer = createPeer();
    return () => newPeer.destroy();
  }, []);

  useEffect(() => {
    if (requestedPeerIdToConnect.trim().length === 0 || !peer) return;

    const connectionWithPeer = peer.connect(requestedPeerIdToConnect);

    connectionWithPeer.on("open", () => {
      setConnections([...connections, connectionWithPeer]);
    });

    connectionWithPeer.on("close", () => {
      setConnections(connections.filter((connection) => connection !== connectionWithPeer));
    });

    return () => connectionWithPeer.close();
  }, [requestedPeerIdToConnect]);

  return (
    <>
      {connections.map((connection) => (
        <ConnectionManager key={connection.connectionId} connection={connection} />
      ))}
    </>
  );
}

function ConnectionManager({ connection }: { connection: DataConnection }) {
  useEffect(() => {
    const [setTimerHours, listenToTimerHoursUpdated, getTimerHours] = timerHoursPubSub;
    const [setTimerMinutes, listenToTimerMinutesUpdated, getTimerMinutes] = timerMinutesPubSub;
    const [setTimerSeconds, listenToTimerSecondsUpdated, getTimerSeconds] = timerSecondsPubSub;

    const syncTime = () => {
      const { hours, minutes, seconds } = timer.getTimeValues();
      connection.send({
        method: RpcMethod.Sync,
        timeValues: { hours, minutes, seconds },
        totalSeconds: timer.getTotalTimeValues().seconds
      });
    };

    syncTime();

    const sendEditTimerNotification = () => {
      connection.send({
        method: RpcMethod.EditTimer,
        hours: getTimerHours(),
        minutes: getTimerMinutes(),
        seconds: getTimerSeconds()
      });
    };

    const stopListeningToTimerHoursUpdated = listenToTimerHoursUpdated(sendEditTimerNotification);
    const stopListeningToTimerMinutesUpdated = listenToTimerMinutesUpdated(sendEditTimerNotification);
    const stopListeningToTimerSecondsUpdated = listenToTimerSecondsUpdated(sendEditTimerNotification);

    const sendStopTimerNotification = () => connection.send({ method: RpcMethod.Stop });

    const sendStartTimerNotification = () => connection.send({ method: RpcMethod.Start });

    timer.on("stopped", sendStopTimerNotification);

    timer.on("started", sendStartTimerNotification);

    timer.on("secondsUpdated", syncTime);

    connection.on("data", (data) => {
      switch ((data as { method: RpcMethod }).method) {
        case RpcMethod.Sync:
          const { timeValues, totalSeconds } = data as SyncNotification;
          if (Math.abs(totalSeconds - timer.getTotalTimeValues().seconds) > 1) {
            if (timer.isRunning()) timer.stop();
            timer.start({
              startValues: timeValues
            });
          }
          break;
        case RpcMethod.Start:
          if (timer.isRunning()) return;
          timer.start({
            startValues: {
              hours: Number(getTimerHours()),
              minutes: Number(getTimerMinutes()),
              seconds: Number(getTimerSeconds())
            }
          });
          break;
        case RpcMethod.Stop:
          if (timer.isRunning()) timer.stop();
          break;
        case RpcMethod.EditTimer:
          const { hours, minutes, seconds } = data as EditTimerNotification;
          if (hours !== getTimerHours()) setTimerHours(hours);
          if (minutes !== getTimerMinutes()) setTimerMinutes(minutes);
          if (seconds !== getTimerSeconds()) setTimerSeconds(seconds);
          break;
      }
    });
    return () => {
      stopListeningToTimerHoursUpdated();
      stopListeningToTimerMinutesUpdated();
      stopListeningToTimerSecondsUpdated();
      timer.off("stopped", sendStopTimerNotification);
      timer.off("started", sendStartTimerNotification);
      timer.off("secondsUpdated", syncTime);
    };
  }, []);

  return <></>;
}
