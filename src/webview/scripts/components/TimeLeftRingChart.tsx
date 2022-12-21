import { useEffect, useState } from "react";
import {
  stopTimerButtonClickedPubSub,
  timer,
  timerHoursPubSub,
  timerMinutesPubSub,
  timerSecondsPubSub
} from "../constants";
import { usePubSub } from "create-pubsub/react";
import { TimerEventType } from "easytimer.js";
import { Button, Center, RingProgress, Text } from "@mantine/core";

export function TimeLeftRingChart() {
  const [timerHours] = usePubSub(timerHoursPubSub);
  const [timerMinutes] = usePubSub(timerMinutesPubSub);
  const [timerSeconds] = usePubSub(timerSecondsPubSub);
  const [percentageOfTimeLeft, setPercentageOfTimeLeft] = useState(100);
  const [, emitStopTimerButtonClicked] = usePubSub(stopTimerButtonClickedPubSub);

  useEffect(() => {
    const timerEventListener = () => {
      setPercentageOfTimeLeft(
        (timer.getTotalTimeValues().seconds /
          (Number(timerHours) * 3600 + Number(timerMinutes) * 60 + Number(timerSeconds))) *
        100
      );
    };

    (["started", "stopped", "secondsUpdated"] as TimerEventType[]).forEach((timerEventType) => {
      timer.on(timerEventType, timerEventListener);
    });

    return () => {
      (["started", "stopped", "secondsUpdated"] as TimerEventType[]).forEach((timerEventType) => {
        timer.off(timerEventType, timerEventListener);
      });
    };
  }, [percentageOfTimeLeft, timerHours, timerMinutes, timerSeconds]);

  return (
    <RingProgress
      size={450}
      thickness={22}
      roundCaps
      sections={[{ value: percentageOfTimeLeft, color: "cyan" }]}
      label={
        <>
          <Text color="cyan" weight={700} align="center" size={384 / 8} className="font-family-E1234">
            {timer.getTimeValues().toString()}
          </Text>
          <Center>
            <Button variant="light" color="gray" compact onClick={() => emitStopTimerButtonClicked()}>
              Stop / Edit
            </Button>
          </Center>
        </>
      }
    />
  );
}
