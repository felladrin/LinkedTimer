import { useEffect, useState } from "react";
import { timer, timerHoursPubSub, timerMinutesPubSub, timerSecondsPubSub } from "../../../../../constants";
import { usePubSub } from "create-pubsub/react";
import { TimerEventType } from "easytimer.js";

/** Derived from Fangzhou Li's CSS Animated Hourglass (https://github.com/riophae/css-animated-hourglass). */
export function AnimatedHourglass() {
  const [timerHours] = usePubSub(timerHoursPubSub);
  const [timerMinutes] = usePubSub(timerMinutesPubSub);
  const [timerSeconds] = usePubSub(timerSecondsPubSub);
  const [hourglassAnimationName, setHourglassAnimationName] = useState("hourglass");
  const [previousHourglassAnimationScale, setPreviousHourglassAnimationScale] = useState(1);
  const [currentHourglassAnimationScale, setCurrentHourglassAnimationScale] = useState(1);

  useEffect(() => {
    const timerEventListener = () => {
      if (timer.isRunning()) {
        setPreviousHourglassAnimationScale(currentHourglassAnimationScale);
        setCurrentHourglassAnimationScale(
          timer.getTotalTimeValues().seconds /
            (Number(timerHours) * 3600 + Number(timerMinutes) * 60 + Number(timerSeconds))
        );
      } else {
        setPreviousHourglassAnimationScale(1);
        setCurrentHourglassAnimationScale(1);
      }

      setHourglassAnimationName(`hourglass${timer.getTotalTimeValues().seconds}`);
    };

    (["started", "stopped", "secondsUpdated"] as TimerEventType[]).forEach((timerEventType) => {
      timer.on(timerEventType, timerEventListener);
    });

    return () => {
      (["started", "stopped", "secondsUpdated"] as TimerEventType[]).forEach((timerEventType) => {
        timer.off(timerEventType, timerEventListener);
      });
    };
  }, [currentHourglassAnimationScale, timerHours, timerMinutes, timerSeconds]);

  return (
    <div className="d-flex justify-content-center">
      <style>
        {`
          #glass-container,
          #glass,
          #layer-1,
          #layer-2 {
            width: 160px;
            height: 180px;
          }
          .triangle {
            border-color: transparent;
            border-style: solid;
            border-width: 120px 80px 0 80px;
            width: 0;
            height: 0;
          }
          .rotate {
            transform: rotateX(180deg);
          }
          .half-glass {
            border-top-color: var(--gray-color-dark);
          }
          .bottom.half-glass {
            margin-top: -60px;
          }
          #layer-1,
          #layer-2 {
            position: absolute;
            left: 0;
            top: 0;
            transform: scale(0.75);
            transform-origin: center top;
          }
          #layer-1 {
            z-index: 5;
          }
          #layer-2 {
            z-index: 10;
          }
          #layer-1 .top.triangle,
          #layer-2 .top.triangle {
            position: absolute;
            bottom: 47px;
          }
          #layer-1 .bottom.triangle,
          #layer-2 .bottom.triangle {
            position: absolute;
            bottom: 107px;
          }
          #layer-1 .top,
          #layer-2 .bottom {
            border-top-color: var(--gray-color);
          }
          #layer-1 .bottom,
          #layer-2 .top {
            border-top-color: var(--red-color-very-dark);
          }
          #layer-2 .triangle {
            transform-origin: center bottom;
          }
          #glass-container {
            position: relative;
          }
          #sand-stream {
            position: absolute;
            left: 50%;
            top: 50%;
            margin-left: -1px;
            z-index: 20;
            width: 2px;
            height: 80px;
            background: var(--red-color-very-dark);
          }
          #bond {
            position: absolute;
            z-index: 100;
            left: 80px;
            top: 90px;
            margin-left: -30px;
            margin-top: -10px;
            width: 0;
            height: 0;
            box-sizing: content-box;
          }
          #bond .triangle {
            border-top-color: var(--gray-color-very-dark);
            width: 20px;
            border-width: 20px 20px 0 20px;
          }
          #bond .bottom {
            border-bottom-color: var(--gray-color-very-dark);
            margin-top: -20px;
            border-width: 0px 20px 20px 20px;
          }
        `}
      </style>
      <div id="glass-container">
        <div id="glass">
          <div className="top half-glass triangle"></div>
          <div className="bottom half-glass triangle rotate"></div>
        </div>
        <div id="layer-1">
          <div>
            <div className="top layer-1 triangle"></div>
          </div>
          <div className="rotate">
            <div className="bottom layer-1 triangle"></div>
          </div>
        </div>
        <div id="layer-2">
          <style>
            {`
              @keyframes ${hourglassAnimationName} {
                from {transform: scale(${previousHourglassAnimationScale})}
                to   {transform: scale(${currentHourglassAnimationScale})}
              }
              #layer-2 .triangle {
                animation: ${hourglassAnimationName} 1s linear 1
              }
            `}
          </style>
          <div>
            <div className="top layer-2 triangle"></div>
          </div>
          <div className="rotate">
            <div className="bottom layer-2 triangle"></div>
          </div>
        </div>
        <div id="sand-stream"></div>
        <div id="bond">
          <div className="top bond triangle"></div>
          <div className="bottom bond triangle"></div>
        </div>
      </div>
    </div>
  );
}
