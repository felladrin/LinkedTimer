import { emitStopTimerButtonClicked, percentageOfTimeLeftPubSub, timerValuesStringPubSub } from "../controllers/timerController";
import { Button, Center, RingProgress, Text } from "@mantine/core";
import { usePubSub } from "create-pubsub/react";

export function TimeLeftRingChart() {
  const [percentageOfTimeLeft] = usePubSub(percentageOfTimeLeftPubSub);
  const [timerValuesString] = usePubSub(timerValuesStringPubSub);

  return (
    <RingProgress
      size={450}
      thickness={22}
      roundCaps
      sections={[{ value: percentageOfTimeLeft, color: "cyan" }]}
      label={
        <>
          <Text color="cyan" weight={700} align="center" size={384 / 8} className="font-family-E1234">
            {timerValuesString}
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
