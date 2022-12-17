import { usePubSub } from "create-pubsub/react";
import {
  currentScreenPubSub,
  hostTimerIdPubSub,
  peer,
  startTimerButtonClickedPubSub,
  stopTimerButtonClickedPubSub,
  timer,
  timerHoursPubSub,
  timerIdToJoinPubSub,
  timerMinutesPubSub,
  timerSecondsPubSub,
} from "../../../../constants";
import { MutableRefObject, useEffect, useRef } from "react";
import { IParsedObject, notification, parse } from "jsonrpc-lite";
import { SyncNotification } from "../../../../types";
import { CurrentScreen } from "../../../../enumerations";

export function JoinScreen() {
  const [timerIdToJoin, setTimerIdToJoin] = usePubSub(timerIdToJoinPubSub);
  const [, setHostTimerId] = usePubSub(hostTimerIdPubSub);
  const timerIdInputReference = useRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement>;
  const [, setCurrentScreen] = usePubSub(currentScreenPubSub);

  useEffect(() => timerIdInputReference.current.focus(), []);

  const handleClickOnConnectButton = () => {
    const [, listenToStartTimerButtonClicked] = startTimerButtonClickedPubSub;
    const [, listenToStopTimerButtonClicked] = stopTimerButtonClickedPubSub;
    const [setTimerHours, listenToTimerHoursUpdated, getTimerHours] = timerHoursPubSub;
    const [setTimerMinutes, listenToTimerMinutesUpdated, getTimerMinutes] = timerMinutesPubSub;
    const [setTimerSeconds, listenToTimerSecondsUpdated, getTimerSeconds] = timerSecondsPubSub;
    const connectionWithHost = peer.connect(timerIdToJoin);
    connectionWithHost.on("open", () => {
      setHostTimerId(timerIdToJoin);

      const sendEditTimerNotification = () => {
        connectionWithHost.send(
          notification("editTimer", {
            hours: getTimerHours(),
            minutes: getTimerMinutes(),
            seconds: getTimerSeconds(),
          }).serialize()
        );
      };

      const stopListeningToTimerHoursUpdated = listenToTimerHoursUpdated(sendEditTimerNotification);
      const stopListeningToTimerMinutesUpdated = listenToTimerMinutesUpdated(sendEditTimerNotification);
      const stopListeningToTimerSecondsUpdated = listenToTimerSecondsUpdated(sendEditTimerNotification);

      const stopListeningToStartTimerButtonClicked = listenToStartTimerButtonClicked(() =>
        connectionWithHost.send(notification("start").serialize())
      );
      const stopListeningToStopTimerButtonClicked = listenToStopTimerButtonClicked(() =>
        connectionWithHost.send(notification("stop").serialize())
      );

      connectionWithHost.on("close", () => {
        stopListeningToStartTimerButtonClicked();
        stopListeningToStopTimerButtonClicked();
        stopListeningToTimerHoursUpdated();
        stopListeningToTimerMinutesUpdated();
        stopListeningToTimerSecondsUpdated();
      });

      connectionWithHost.on("data", (data) => {
        const jsonRpc = parse(data as string) as IParsedObject;
        if (jsonRpc.type === "notification") {
          switch (jsonRpc.payload.method) {
            case "sync":
              const { config, timeValues, totalSeconds } = jsonRpc.payload.params as SyncNotification;
              if (Math.abs(totalSeconds - timer.getTotalTimeValues().seconds) > 1) {
                if (timer.isRunning()) timer.stop();
                timer.start({
                  ...config,
                  startValues: timeValues,
                });
              }
              break;
            case "start":
              timer.start({
                startValues: {
                  hours: Number(getTimerHours()),
                  minutes: Number(getTimerMinutes()),
                  seconds: Number(getTimerSeconds()),
                },
              });
              break;
            case "stop":
              timer.stop();
              break;
            case "editTimer":
              const { hours, minutes, seconds } = jsonRpc.payload.params as {
                hours: string;
                minutes: string;
                seconds: string;
              };
              if (hours !== getTimerHours()) setTimerHours(hours);
              if (minutes !== getTimerMinutes()) setTimerMinutes(minutes);
              if (seconds !== getTimerSeconds()) setTimerSeconds(seconds);
              break;
          }
        }
      });
      setCurrentScreen(CurrentScreen.TimerScreen);
    });
  };

  useEffect(() => {
    if (timerIdToJoin.length > 0) {
      peer.open ? handleClickOnConnectButton() : peer.once("open", handleClickOnConnectButton);
    }
  }, []);

  return (
    <>
      <div className="content">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Timer ID to connect"
            value={timerIdToJoin}
            onChange={({ target }) => setTimerIdToJoin(target.value)}
            ref={timerIdInputReference}
          />
          <div className="input-group-append">
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleClickOnConnectButton}
              disabled={timerIdToJoin.trim().length == 0}
            >
              Connect
            </button>
          </div>
        </div>
      </div>
      <div className="content">
        <div className="text-left mt-20">
          <button type="button" className="btn btn-sm" onClick={() => setCurrentScreen(CurrentScreen.InitialScreen)}>
            &larr; Back
          </button>
        </div>
      </div>
    </>
  );
}
