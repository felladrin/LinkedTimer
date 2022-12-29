import {
  emitStartTimerButtonClicked,
  isTimerRunningPubSub,
  timerHoursLocalStorageProperties,
  timerMinutesLocalStorageProperties,
  timerSecondsLocalStorageProperties,
} from "../controllers/timerController";
import { TimeLeftRingChart } from "./TimeLeftRingChart";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Button, Grid, NumberInput } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { usePubSub } from "create-pubsub/react";

export function TimerScreen() {
  const [isTimerRunning] = usePubSub(isTimerRunningPubSub);
  const [timerHours, setTimerHours] = useLocalStorage(timerHoursLocalStorageProperties);
  const [timerMinutes, setTimerMinutes] = useLocalStorage(timerMinutesLocalStorageProperties);
  const [timerSeconds, setTimerSeconds] = useLocalStorage(timerSecondsLocalStorageProperties);
  const [timerControlsParent] = useAutoAnimate<HTMLDivElement>();

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
