import { emitStartTimerButtonClicked, isTimerRunningPubSub, timerStartValuesPubSub } from "../constants/timer";
import { TimeLeftRingChart } from "./TimeLeftRingChart";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Button, Grid, NumberInput } from "@mantine/core";
import { usePubSub } from "create-pubsub/react";

export function TimerScreen() {
  const [isTimerRunning] = usePubSub(isTimerRunningPubSub);
  const [timerStartValues, setTimerStartValues] = usePubSub(timerStartValuesPubSub);
  const [timerControlsParent] = useAutoAnimate<HTMLDivElement>();

  return (
    <div ref={timerControlsParent}>
      {isTimerRunning ? (
        <TimeLeftRingChart />
      ) : (
        <Grid grow align="flex-end" p="md">
          <Grid.Col span={3}>
            <NumberInput
              label="Hours"
              value={timerStartValues.hours}
              max={24}
              min={0}
              onChange={(value) =>
                setTimerStartValues({
                  ...timerStartValues,
                  hours: value || 0,
                })
              }
              classNames={{ input: "font-family-E1234" }}
              formatter={(value) => value?.padStart(2, "0") as string}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <NumberInput
              label="Minutes"
              value={timerStartValues.minutes}
              max={59}
              min={0}
              onChange={(value) =>
                setTimerStartValues({
                  ...timerStartValues,
                  minutes: value || 0,
                })
              }
              classNames={{ input: "font-family-E1234" }}
              formatter={(value) => value?.padStart(2, "0") as string}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <NumberInput
              label="Seconds"
              value={timerStartValues.seconds}
              max={59}
              min={0}
              onChange={(value) =>
                setTimerStartValues({
                  ...timerStartValues,
                  seconds: value || 0,
                })
              }
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
  );
}
