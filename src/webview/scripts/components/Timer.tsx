import { isTimerRunningPubSub } from "../constants/timer";
import { TimerProgress } from "./TimerProgress";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { usePubSub } from "create-pubsub/react";
import { TimerEditor } from "./TimerEditor";

export function Timer() {
  const [isTimerRunning] = usePubSub(isTimerRunningPubSub);
  const [timerControlsParent] = useAutoAnimate<HTMLDivElement>();

  return <div ref={timerControlsParent}>{isTimerRunning ? <TimerProgress /> : <TimerEditor />}</div>;
}
