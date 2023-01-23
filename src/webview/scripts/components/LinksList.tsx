import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Timeline, Text } from "@mantine/core";
import { IconLink } from "@tabler/icons-react";
import { usePubSub } from "create-pubsub/react";
import { selfId } from "trystero";
import { roomPeersPubSub } from "../constants/room";
import { monospaceFontFamily } from "../constants/strings";

export function LinksList() {
  const [roomPeers] = usePubSub(roomPeersPubSub);
  const [autoAnimatedRef] = useAutoAnimate<HTMLDivElement>();

  return (
    <Timeline active={roomPeers.length} bulletSize={20} lineWidth={2} ref={autoAnimatedRef}>
      <Timeline.Item
        title={
          <Text truncate size="xs" sx={{ fontFamily: monospaceFontFamily }}>
            {selfId} (You)
          </Text>
        }
        bullet={<IconLink size={12} />}
        lineVariant="dashed"
      />
      {roomPeers.length > 0 ? (
        roomPeers.map((peer) => (
          <Timeline.Item
            key={peer}
            title={
              <Text truncate size="xs" sx={{ fontFamily: monospaceFontFamily }}>
                {peer}
              </Text>
            }
            bullet={<IconLink size={12} />}
            lineVariant="dashed"
          />
        ))
      ) : (
        <Timeline.Item
          title={
            <div>
              <Text truncate size="sm">
                Invite or join someone else.
              </Text>
            </div>
          }
          bullet={<IconLink size={12} />}
          lineVariant="dashed"
        />
      )}
    </Timeline>
  );
}
