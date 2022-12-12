import { createPubSub } from "create-pubsub";
import { usePubSub } from "create-pubsub/react";
import Timer, { TimeCounter, TimerEventType, TimerParams } from "easytimer.js";
import halfmoon from "halfmoon";
import { IParsedObject, notification, parse } from "jsonrpc-lite";
import Peer, { DataConnection } from "peerjs";
import { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { createRoot } from "react-dom/client";

declare const acquireVsCodeApi: () => {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
};

const vsCodeApi = "acquireVsCodeApi" in window ? acquireVsCodeApi() : null;

const extensionName = "Linked Timer";

const timer = new Timer({
  countdown: true,
  startValues: { hours: 0, minutes: 1, seconds: 0 },
});

const peer = new Peer();

enum CurrentScreen {
  InitialScreen,
  JoinScreen,
  TimerScreen,
}

const hostTimerIdPubSub = createPubSub("");
const startTimerButtonClickedPubSub = createPubSub();
const stopTimerButtonClickedPubSub = createPubSub();
const timerHoursPubSub = createPubSub("00");
const timerMinutesPubSub = createPubSub("01");
const timerSecondsPubSub = createPubSub("00");
const currentScreenPubSub = createPubSub(CurrentScreen.InitialScreen);

type EditTimerNotification = {
  hours: string;
  minutes: string;
  seconds: string;
};

type SyncNotification = {
  config: TimerParams;
  timeValues: TimeCounter;
  totalSeconds: number;
};

function StickyAlertsContainer() {
  useEffect(() => halfmoon.onDOMContentLoaded(), []);
  return <div className="sticky-alerts"></div>;
}

function Root() {
  const [currentScreen] = usePubSub(currentScreenPubSub);

  const getComponentFromCurrentScreen = () => {
    switch (currentScreen) {
      case CurrentScreen.JoinScreen:
        return <JoinScreen />;
      case CurrentScreen.TimerScreen:
        return <TimerScreen />;
      case CurrentScreen.InitialScreen:
      default:
        return <InitialScreen />;
    }
  };

  return (
    <>
      <StickyAlertsContainer />
      {getComponentFromCurrentScreen()}
    </>
  );
}

function InitialScreen() {
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

        connectionWithGuest.on("close", () => {
          stopListeningToTimerHoursUpdated();
          stopListeningToTimerMinutesUpdated();
          stopListeningToTimerSecondsUpdated();
        });

        timer.on("stopped", () => connectionWithGuest.send(notification("stop").serialize()));

        timer.on("started", () => connectionWithGuest.send(notification("start").serialize()));

        timer.on("secondsUpdated", syncGuest);

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
    <div className="card">
      <div className="content">
        <div className="container-fluid">
          <div className="row row-eq-spacing">
            <div className="col">
              <button type="button" className="btn btn-primary btn-block mr-10" onClick={handleHostButtonClicked}>
                Host a Timer
              </button>
            </div>
            <div className="v-spacer d-sm-none"></div>
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
    </div>
  );
}

function JoinScreen() {
  const [timerId, setTimerId] = useState("");
  const [, setHostTimerId] = usePubSub(hostTimerIdPubSub);
  const timerIdInputReference = useRef<HTMLInputElement>(null);
  const [, setCurrentScreen] = usePubSub(currentScreenPubSub);

  useEffect(() => timerIdInputReference.current?.focus(), []);

  const handleClickOnConnectButton = () => {
    const [, listenToStartTimerButtonClicked] = startTimerButtonClickedPubSub;
    const [, listenToStopTimerButtonClicked] = stopTimerButtonClickedPubSub;
    const [setTimerHours, listenToTimerHoursUpdated, getTimerHours] = timerHoursPubSub;
    const [setTimerMinutes, listenToTimerMinutesUpdated, getTimerMinutes] = timerMinutesPubSub;
    const [setTimerSeconds, listenToTimerSecondsUpdated, getTimerSeconds] = timerSecondsPubSub;
    const connectionWithHost = peer.connect(timerId);
    connectionWithHost.on("open", () => {
      setHostTimerId(timerId);

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

  return (
    <div className="card">
      <div className="content">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Timer ID to connect"
            onChange={({ target }) => setTimerId(target.value)}
            ref={timerIdInputReference}
          />
          <div className="input-group-append">
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleClickOnConnectButton}
              disabled={timerId.trim().length == 0}
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
    </div>
  );
}

function TimerScreen() {
  const [timerValues, setTimerValues] = useState(timer.getTimeValues().toString());
  const [isTimerRunning, setTimerRunning] = useState(timer.isRunning());
  const [hostTimerId] = usePubSub(hostTimerIdPubSub);
  const [, emitStartTimerButtonClicked] = usePubSub(startTimerButtonClickedPubSub);
  const [, emitStopTimerButtonClicked] = usePubSub(stopTimerButtonClickedPubSub);
  const [timerHours, setHours] = usePubSub(timerHoursPubSub);
  const [timerMinutes, setMinutes] = usePubSub(timerMinutesPubSub);
  const [timerSeconds, setSeconds] = usePubSub(timerSecondsPubSub);
  const timerIdInputReference = useRef<HTMLInputElement>(null);
  const [hasJustCopiedTimerId, setJustCopiedTimerId] = useState(false);

  useEffect(() => timerIdInputReference.current?.focus(), []);

  useEffect(() => {
    const timerEventListener = () => {
      const timerValuesAsString = timer.getTimeValues().toString();
      document.title = timerValuesAsString;
      vsCodeApi?.postMessage({ panelTitle: document.title });
      setTimerValues(timerValuesAsString);
      setTimerRunning(timer.isRunning());
    };

    const targetAchievedListener = () => {
      const timeIsUpMessage = `Time's up!`;
      document.title = `${timeIsUpMessage} | ${extensionName}`;
      vsCodeApi?.postMessage({ panelTitle: `${extensionName}: ${timeIsUpMessage}` });
      vsCodeApi?.postMessage({ informationMessage: `${extensionName}: ${timeIsUpMessage}` });
    };

    (["started", "stopped", "secondsUpdated"] as TimerEventType[]).forEach((timerEventType) => {
      timer.on(timerEventType, timerEventListener);
    });

    timer.on("targetAchieved", targetAchievedListener);

    return () => {
      (["started", "stopped", "secondsUpdated"] as TimerEventType[]).forEach((timerEventType) => {
        timer.off(timerEventType, timerEventListener);
      });

      timer.off("targetAchieved", targetAchievedListener);
    };
  }, []);

  const handleCopyButtonClicked = () => setJustCopiedTimerId(true);

  useEffect(() => {
    let timeoutId = 0;
    if (hasJustCopiedTimerId) {
      timeoutId = window.setTimeout(() => setJustCopiedTimerId(false), 3000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [hasJustCopiedTimerId]);

  return (
    <div className="card">
      <div className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col">
              {!isTimerRunning ? (
                <div className="input-group">
                  <input
                    type="tel"
                    pattern="[0-9]{2}"
                    placeholder="00"
                    className="form-control flex-reset w-50 text-center font-family-E1234"
                    minLength={1}
                    maxLength={2}
                    value={timerHours}
                    onChange={({ target }) => {
                      if (!isNaN(Number(target.value))) setHours(target.value);
                    }}
                    ref={timerIdInputReference}
                  />
                  <div className="input-group-prepend">
                    <span className="input-group-text font-family-E1234">:</span>
                  </div>
                  <input
                    type="tel"
                    pattern="[0-9]{2}"
                    placeholder="00"
                    className="form-control flex-reset w-50 text-center font-family-E1234"
                    minLength={1}
                    maxLength={2}
                    value={timerMinutes}
                    onChange={({ target }) => {
                      if (!isNaN(Number(target.value))) setMinutes(target.value);
                    }}
                  />
                  <div className="input-group-prepend">
                    <span className="input-group-text font-family-E1234">:</span>
                  </div>
                  <input
                    type="tel"
                    pattern="[0-9]{2}"
                    placeholder="00"
                    className="form-control flex-reset w-50 text-center font-family-E1234"
                    minLength={1}
                    maxLength={2}
                    value={timerSeconds}
                    onChange={({ target }) => {
                      if (!isNaN(Number(target.value))) setSeconds(target.value);
                    }}
                  />
                  <div className="input-group-append">
                    <button className="btn btn-success" type="button" onClick={() => emitStartTimerButtonClicked()}>
                      Start
                    </button>
                  </div>
                </div>
              ) : null}
              {isTimerRunning ? (
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text font-family-E1234">{timerValues}</span>
                  </div>
                  <div className="input-group-append">
                    <button className="btn" type="button" onClick={() => emitStopTimerButtonClicked()}>
                      Stop / Edit
                    </button>
                  </div>
                </div>
              ) : null}
              <details className="collapse-panel w-400 mw-full mt-20" open>
                <summary className="collapse-header">Invite others by providing this Timer ID</summary>
                <div className="collapse-content">
                  <div className="input-group">
                    <input type="text" className="form-control" value={hostTimerId} readOnly />
                    <div className="input-group-append">
                      <CopyToClipboard text={hostTimerId} onCopy={handleCopyButtonClicked}>
                        <button className="btn" type="button">
                          {hasJustCopiedTimerId ? <>&#10003;</> : <>&#128203;</>}
                        </button>
                      </CopyToClipboard>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = document.createElement("div");
root.classList.add("page-wrapper");
root.classList.add("root");
document.body.appendChild(root);
createRoot(root).render(<Root />);
