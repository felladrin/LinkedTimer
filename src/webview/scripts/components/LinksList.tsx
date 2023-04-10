import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Timeline, Text, Tooltip } from "@mantine/core";
import { IconBroadcast, IconLink } from "@tabler/icons-react";
import { usePubSub } from "create-pubsub/react";
import { roomPeersIdsPubSub, roomPubSub } from "../constants/room";
import { monospaceFontFamily } from "../constants/strings";
import { ReactNode } from "react";

export function LinksList() {
  const [roomPeersIds] = usePubSub(roomPeersIdsPubSub);
  const [room] = usePubSub(roomPubSub);
  const [autoAnimatedRef] = useAutoAnimate<HTMLDivElement>();

  return (
    <Timeline active={roomPeersIds.length} bulletSize={20} lineWidth={2} ref={autoAnimatedRef}>
      {room?.selfPeerId && (
        <Timeline.Item
          title={
            <TimerIdTooltip label="Your Timer ID">
              <Text truncate size="xs" sx={{ fontFamily: monospaceFontFamily }}>
                {room.selfPeerId}
              </Text>
            </TimerIdTooltip>
          }
          bullet={<IconBroadcast size={12} />}
          lineVariant="dashed"
        />
      )}
      {roomPeersIds.length > 0 ? (
        roomPeersIds.map((peerId) => (
          <Timeline.Item
            key={peerId}
            title={
              <TimerIdTooltip label="Linked Timer ID">
                <Text truncate size="xs" sx={{ fontFamily: monospaceFontFamily }}>
                  {peerId}
                </Text>
              </TimerIdTooltip>
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

function TimerIdTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip
      label={label}
      color="blue"
      position="bottom"
      withArrow
      transitionProps={{ transition: "pop", duration: 300 }}
    >
      {children}
    </Tooltip>
  );
}
