import { emitStopTimerButtonClicked, percentageOfTimeLeftPubSub, timerValuesStringPubSub } from "../constants/timer";
import { Button, Center, RingProgress, Text } from "@mantine/core";
import { usePubSub } from "create-pubsub/react";
import { useElementSize } from "@mantine/hooks";
import { appWidth } from "../constants/numbers";
import { clockFontFamily } from "../constants/strings";

export function TimerProgress() {
  const [percentageOfTimeLeft] = usePubSub(percentageOfTimeLeftPubSub);
  const [timerValuesString] = usePubSub(timerValuesStringPubSub);
  const { ref, width } = useElementSize();

  return (
    <div ref={ref}>
      <RingProgress
        size={width || appWidth}
        thickness={width * 0.05}
        roundCaps
        sections={[{ value: percentageOfTimeLeft, color: "cyan" }]}
        label={
          <>
            <Text c="cyan" fw={700} ta="center" style={{ fontSize: width * 0.1, fontFamily: clockFontFamily }}>
              {timerValuesString}
            </Text>
            <Center>
              <Button variant="light" color="gray" size="compact-sm" onClick={() => emitStopTimerButtonClicked()}>
                Stop / Edit
              </Button>
            </Center>
          </>
        }
      />
    </div>
  );
}
