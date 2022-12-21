import { MutableRefObject, useEffect, useRef, useState } from "react";
import {
  startTimerButtonClickedPubSub,
  timer,
  timerHoursPubSub,
  timerMinutesPubSub,
  timerSecondsPubSub
} from "../constants";
import { usePubSub } from "create-pubsub/react";
import { TimerEventType } from "easytimer.js";
import { TimeLeftRingChart } from "./TimeLeftRingChart";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Button, Grid, NumberInput } from "@mantine/core";

export function TimerScreen() {
  const [isTimerRunning, setTimerRunning] = useState(timer.isRunning());
  const [, emitStartTimerButtonClicked] = usePubSub(startTimerButtonClickedPubSub);
  const [timerHours, setHours] = usePubSub(timerHoursPubSub);
  const [timerMinutes, setMinutes] = usePubSub(timerMinutesPubSub);
  const [timerSeconds, setSeconds] = usePubSub(timerSecondsPubSub);
  const timerIdInputReference = useRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement>;
  const [timerControlsParent] = useAutoAnimate<HTMLDivElement>();

  useEffect(() => timerIdInputReference.current.focus(), []);

  useEffect(() => {
    const timerEventListener = () => {
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
    <>
      <div ref={timerControlsParent}>
        {isTimerRunning ? (
          <TimeLeftRingChart />
        ) : (
          <Grid grow align="flex-end" p="md">
            <Grid.Col span={3}>
              <NumberInput
                placeholder="0"
                label="Hours"
                value={Number(timerHours)}
                max={24}
                min={0}
                ref={timerIdInputReference}
                onChange={(value) => {
                  if (value !== undefined) setHours(value.toString());
                }}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <NumberInput
                placeholder="0"
                label="Minutes"
                value={Number(timerMinutes)}
                max={59}
                min={0}
                onChange={(value) => {
                  if (value !== undefined) setMinutes(value.toString());
                }}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <NumberInput
                placeholder="0"
                label="Seconds"
                value={Number(timerSeconds)}
                max={59}
                min={0}
                onChange={(value) => {
                  if (value !== undefined) setSeconds(value.toString());
                }}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Button variant="light" color="cyan" onClick={() => emitStartTimerButtonClicked()} fullWidth>
                Start
              </Button>
            </Grid.Col>
          </Grid>
        )}
      </div>
    </>
  );
}
