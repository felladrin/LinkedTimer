import { emitStopTimerButtonClicked, percentageOfTimeLeftPubSub, timerValuesStringPubSub } from "../constants/timer";
import { Button, Center, RingProgress, Text } from "@mantine/core";
import { usePubSub } from "create-pubsub/react";
import { useElementSize } from "@mantine/hooks";

export function TimeLeftRingChart() {
  const [percentageOfTimeLeft] = usePubSub(percentageOfTimeLeftPubSub);
  const [timerValuesString] = usePubSub(timerValuesStringPubSub);
  const { ref, width } = useElementSize();

  return (
    <div ref={ref}>
      <RingProgress
        size={width || 450}
        thickness={width * 0.05}
        roundCaps
        sections={[{ value: percentageOfTimeLeft, color: "cyan" }]}
        label={
          <>
            <Text color="cyan" weight={700} align="center" size={width * 0.1} className="font-family-E1234">
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
    </div>
  );
}
