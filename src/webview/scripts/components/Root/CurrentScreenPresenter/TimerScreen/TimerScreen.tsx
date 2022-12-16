import { MutableRefObject, useEffect, useRef, useState } from "react";
import {
  startTimerButtonClickedPubSub,
  stopTimerButtonClickedPubSub,
  timer,
  timerHoursPubSub,
  timerMinutesPubSub,
  timerSecondsPubSub
} from "../../../../constants";
import { usePubSub } from "create-pubsub/react";
import { TimerEventType } from "easytimer.js";
import { InviteOthersLink } from "./InviteOthersLink/InviteOthersLink";

export function TimerScreen() {
  const [timerValues, setTimerValues] = useState(timer.getTimeValues().toString());
  const [isTimerRunning, setTimerRunning] = useState(timer.isRunning());
  const [, emitStartTimerButtonClicked] = usePubSub(startTimerButtonClickedPubSub);
  const [, emitStopTimerButtonClicked] = usePubSub(stopTimerButtonClickedPubSub);
  const [timerHours, setHours] = usePubSub(timerHoursPubSub);
  const [timerMinutes, setMinutes] = usePubSub(timerMinutesPubSub);
  const [timerSeconds, setSeconds] = usePubSub(timerSecondsPubSub);
  const timerIdInputReference = useRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement>;

  useEffect(() => timerIdInputReference.current.focus(), []);

  useEffect(() => {
    const timerEventListener = () => {
      setTimerValues(timer.getTimeValues().toString());
      setTimerRunning(timer.isRunning());
    };

    (["started", "stopped", "secondsUpdated"] as TimerEventType[]).forEach((timerEventType) => {
      timer.on(timerEventType, timerEventListener);
    });

    return () => {
      (["started", "stopped", "secondsUpdated"] as TimerEventType[]).forEach((timerEventType) => {
        timer.off(timerEventType, timerEventListener);
      });
    };
  }, []);

  return (
    <div className="card">
      <div className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col">
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
              ) : (
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
              )}
              <InviteOthersLink />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}