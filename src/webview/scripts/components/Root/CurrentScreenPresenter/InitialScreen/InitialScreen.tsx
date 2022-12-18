import { useEffect, useState } from "react";
import { usePubSub } from "create-pubsub/react";
import {
  currentScreenPubSub,
  hostTimerIdPubSub,
  peer,
  startTimerButtonClickedPubSub,
  stopTimerButtonClickedPubSub,
  timer,
  timerHoursPubSub,
  timerMinutesPubSub,
  timerSecondsPubSub,
} from "../../../../constants";
import { DataConnection } from "peerjs";
import { IParsedObject, notification, parse } from "jsonrpc-lite";
import { EditTimerNotification } from "../../../../types";
import { CurrentScreen } from "../../../../enumerations";

export function InitialScreen() {
  const [, setButtonDisabled] = useState(true);
  const [, setHostTimerId] = usePubSub(hostTimerIdPubSub);
  const [, setCurrentScreen] = usePubSub(currentScreenPubSub);

  const handleHostButtonClicked = () => {
    setHostTimerId(peer.id);
    const [, listenToStartTimerButtonClicked] = startTimerButtonClickedPubSub;
    const [, listenToStopTimerButtonClicked] = stopTimerButtonClickedPubSub;
    const [setTimerHours, listenToTimerHoursUpdated, getTimerHours] = timerHoursPubSub;
    const [setTimerMinutes, listenToTimerMinutesUpdated, getTimerMinutes] = timerMinutesPubSub;
    const [setTimerSeconds, listenToTimerSecondsUpdated, getTimerSeconds] = timerSecondsPubSub;
    listenToStartTimerButtonClicked(() =>
      timer.start({
        startValues: {
          hours: Number(getTimerHours()),
          minutes: Number(getTimerMinutes()),
          seconds: Number(getTimerSeconds()),
        },
      })
    );
    listenToStopTimerButtonClicked(() => timer.stop());
    peer.on("connection", (connectionWithGuest: DataConnection) => {
      connectionWithGuest.on("open", () => {
        const syncGuest = () => {
          connectionWithGuest.send(
            notification("sync", {
              config: timer.getConfig(),
              timeValues: timer.getTimeValues(),
              totalSeconds: timer.getTotalTimeValues().seconds,
            }).serialize()
          );
        };

        syncGuest();

        const sendEditTimerNotification = () => {
          connectionWithGuest.send(
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

        const sendStopTimerNotification = () => connectionWithGuest.send(notification("stop").serialize());

        const sendStartTimerNotification = () => connectionWithGuest.send(notification("start").serialize());

        timer.on("stopped", sendStopTimerNotification);

        timer.on("started", sendStartTimerNotification);

        timer.on("secondsUpdated", syncGuest);

        connectionWithGuest.on("close", () => {
          stopListeningToTimerHoursUpdated();
          stopListeningToTimerMinutesUpdated();
          stopListeningToTimerSecondsUpdated();
          timer.off("stopped", sendStopTimerNotification);
          timer.off("started", sendStartTimerNotification);
          timer.off("secondsUpdated", syncGuest);
        });

        connectionWithGuest.on("data", (data) => {
          const jsonRpc = parse(data as string) as IParsedObject;
          if (jsonRpc.type === "notification") {
            switch (jsonRpc.payload.method) {
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
                const { hours, minutes, seconds } = jsonRpc.payload.params as EditTimerNotification;
                if (hours !== getTimerHours()) setTimerHours(hours);
                if (minutes !== getTimerMinutes()) setTimerMinutes(minutes);
                if (seconds !== getTimerSeconds()) setTimerSeconds(seconds);
                break;
            }
          }
        });
      });
    });

    setCurrentScreen(CurrentScreen.TimerScreen);
  };

  useEffect(() => {
    if (peer.open) {
      setButtonDisabled(false);
    } else {
      peer.once("open", () => setButtonDisabled(false));
    }
  }, []);

  return (
    <div className="content">
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <button type="button" className="btn btn-primary btn-block mr-10" onClick={handleHostButtonClicked}>
              Host a Timer
            </button>
          </div>
        </div>
        <div className="row mt-20">
          <div className="col">
            <button
              type="button"
              className="btn btn-success btn-block"
              onClick={() => setCurrentScreen(CurrentScreen.JoinScreen)}
            >
              Join a Timer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
