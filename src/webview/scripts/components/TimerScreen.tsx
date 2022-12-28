import { useContext, useEffect, useState } from "react";
import {
  startTimerButtonClickedPubSub,
  TimerContext,
  timerHoursLocalStorageProperties,
  timerMinutesLocalStorageProperties,
  timerSecondsLocalStorageProperties,
} from "../constants";
import { usePubSub } from "create-pubsub/react";
import { TimerEventType } from "easytimer.js";
import { TimeLeftRingChart } from "./TimeLeftRingChart";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Button, Grid, NumberInput } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";

export function TimerScreen() {
  const timer = useContext(TimerContext);
  const [isTimerRunning, setTimerRunning] = useState(timer.isRunning());
  const [, emitStartTimerButtonClicked] = usePubSub(startTimerButtonClickedPubSub);
  const [timerHours, setTimerHours] = useLocalStorage(timerHoursLocalStorageProperties);
  const [timerMinutes, setTimerMinutes] = useLocalStorage(timerMinutesLocalStorageProperties);
  const [timerSeconds, setTimerSeconds] = useLocalStorage(timerSecondsLocalStorageProperties);
  const [timerControlsParent] = useAutoAnimate<HTMLDivElement>();

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
                label="Hours"
                value={timerHours}
                max={24}
                min={0}
                onChange={(value) => setTimerHours(value || 0)}
                classNames={{ input: "font-family-E1234" }}
                formatter={(value) => value?.padStart(2, "0") as string}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <NumberInput
                label="Minutes"
                value={timerMinutes}
                max={59}
                min={0}
                onChange={(value) => setTimerMinutes(value || 0)}
                classNames={{ input: "font-family-E1234" }}
                formatter={(value) => value?.padStart(2, "0") as string}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <NumberInput
                label="Seconds"
                value={timerSeconds}
                max={59}
                min={0}
                onChange={(value) => setTimerSeconds(value || 0)}
                classNames={{ input: "font-family-E1234" }}
                formatter={(value) => value?.padStart(2, "0") as string}
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
