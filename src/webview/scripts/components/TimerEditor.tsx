import { emitStartTimerButtonClicked, timerStartValuesPubSub } from "../constants/timer";
import { Button, Grid } from "@mantine/core";
import { usePubSub } from "create-pubsub/react";
import { TimerInput } from "./TimerInput";

export function TimerEditor() {
  const [timerStartValues, setTimerStartValues] = usePubSub(timerStartValuesPubSub);

  return (
    <Grid grow p="md">
      <Grid.Col span={4}>
        <TimerInput
          label="Hours"
          value={timerStartValues.hours}
          max={24}
          min={0}
          onChange={(value) => setTimerStartValues({ ...timerStartValues, hours: value || 0 })}
        />
      </Grid.Col>
      <Grid.Col span={4}>
        <TimerInput
          label="Minutes"
          value={timerStartValues.minutes}
          max={59}
          min={0}
          onChange={(value) => setTimerStartValues({ ...timerStartValues, minutes: value || 0 })}
        />
      </Grid.Col>
      <Grid.Col span={4}>
        <TimerInput
          label="Seconds"
          value={timerStartValues.seconds}
          max={59}
          min={0}
          onChange={(value) => setTimerStartValues({ ...timerStartValues, seconds: value || 0 })}
        />
      </Grid.Col>
      <Grid.Col span={12}>
        <Button variant="light" color="cyan" onClick={() => emitStartTimerButtonClicked()} fullWidth>
          Start
        </Button>
      </Grid.Col>
    </Grid>
  );
}
