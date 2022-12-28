import { useContext, useEffect } from "react";
import Peer, { DataConnection } from "peerjs";
import {
  PeerContext,
  TimerContext,
  timerHoursLocalStorageProperties,
  timerMinutesLocalStorageProperties,
  timerSecondsLocalStorageProperties,
} from "../constants";
import { useLocalStorage } from "@mantine/hooks";
import { type PublishFunction } from "create-pubsub";

enum RpcMethod {
  Start = "Start",
  Stop = "Stop",
  Sync = "Sync",
  EditTimer = "EditTimer",
}

type EditTimerParameters = {
  hours: number;
  minutes: number;
  seconds: number;
};

type SyncParameters = {
  timeValues: { hours: number; minutes: number; seconds: number };
  totalSeconds: number;
  peerIds: string[];
};

type PeerData<T = void> = {
  method: RpcMethod;
  parameters: T;
};

export function PeerManager() {
  const [peer, , connections, connectToPeer] = useContext(PeerContext);

  const connectedPeerIds = connections.map((connection) => connection.peer);

  return (
    <>
      {connections.map((connection) => (
        <ConnectionManager
          key={connection.connectionId}
          connection={connection}
          connectedPeerIds={connectedPeerIds}
          currentPeerId={(peer as Peer).id}
          connectToPeer={connectToPeer}
        />
      ))}
    </>
  );
}

function ConnectionManager({
  connection,
  connectedPeerIds,
  connectToPeer,
  currentPeerId,
}: {
  connection: DataConnection;
  connectedPeerIds: string[];
  connectToPeer: PublishFunction<string>;
  currentPeerId: string;
}) {
  const timer = useContext(TimerContext);
  const [timerHours, setTimerHours] = useLocalStorage(timerHoursLocalStorageProperties);
  const [timerMinutes, setTimerMinutes] = useLocalStorage(timerMinutesLocalStorageProperties);
  const [timerSeconds, setTimerSeconds] = useLocalStorage(timerSecondsLocalStorageProperties);

  useEffect(() => {
    connection.send({
      method: RpcMethod.EditTimer,
      parameters: {
        hours: timerHours,
        minutes: timerMinutes,
        seconds: timerSeconds,
      },
    } as PeerData<EditTimerParameters>);
  }, [timerHours, timerMinutes, timerSeconds]);

  useEffect(() => {
    const handleConnectionData = (data: unknown) => {
      switch ((data as PeerData).method) {
        case RpcMethod.Sync:
          const { timeValues, totalSeconds, peerIds } = (data as PeerData<SyncParameters>).parameters;
          if (Math.abs(totalSeconds - timer.getTotalTimeValues().seconds) > 1) {
            if (timer.isRunning()) timer.stop();
            timer.start({
              startValues: timeValues,
            });
          }
          peerIds.forEach((peerId) => {
            if (!connectedPeerIds.includes(peerId) && peerId !== currentPeerId) {
              connectToPeer(peerId);
            }
          });
          break;
        case RpcMethod.Start:
          if (timer.isRunning()) return;
          timer.start({
            startValues: {
              hours: timerHours,
              minutes: timerMinutes,
              seconds: timerSeconds,
            },
          });
          break;
        case RpcMethod.Stop:
          if (timer.isRunning()) timer.stop();
          break;
        case RpcMethod.EditTimer:
          const { hours, minutes, seconds } = (data as PeerData<EditTimerParameters>).parameters;
          if (hours !== timerHours) setTimerHours(hours);
          if (minutes !== timerMinutes) setTimerMinutes(minutes);
          if (seconds !== timerSeconds) setTimerSeconds(seconds);
          break;
      }
    };

    connection.on("data", handleConnectionData);

    return () => {
      connection.off("data", handleConnectionData);
    };
  }, [timerHours, timerMinutes, timerSeconds]);

  useEffect(() => {
    const sendStopTimerNotification = () => connection.send({ method: RpcMethod.Stop } as PeerData);

    const sendStartTimerNotification = () => connection.send({ method: RpcMethod.Start } as PeerData);

    timer.on("stopped", sendStopTimerNotification);
    timer.on("started", sendStartTimerNotification);

    return () => {
      timer.off("stopped", sendStopTimerNotification);
      timer.off("started", sendStartTimerNotification);
    };
  }, []);

  useEffect(() => {
    const syncTime = () => {
      const { hours, minutes, seconds } = timer.getTimeValues();
      connection.send({
        method: RpcMethod.Sync,
        parameters: {
          timeValues: { hours, minutes, seconds },
          totalSeconds: timer.getTotalTimeValues().seconds,
          peerIds: connectedPeerIds,
        },
      } as PeerData<SyncParameters>);
    };

    syncTime();

    timer.on("secondsUpdated", syncTime);

    return () => {
      timer.off("secondsUpdated", syncTime);
    };
  }, []);

  return <></>;
}
