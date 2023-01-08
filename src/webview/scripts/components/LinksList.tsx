import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Timeline, Text, Center } from "@mantine/core";
import { IconLink, IconLinkOff } from "@tabler/icons";
import { usePubSub } from "create-pubsub/react";
import { peerConnectionsPubSub } from "../constants/peer";
import { monospaceFontFamily } from "../constants/strings";

export function LinksList() {
  const [peerConnections] = usePubSub(peerConnectionsPubSub);
  const [autoAnimatedRef] = useAutoAnimate<HTMLDivElement>();

  return (
    <Timeline active={peerConnections.length - 1} bulletSize={20} lineWidth={2} ref={autoAnimatedRef}>
      {peerConnections.length > 0 ? (
        peerConnections.map((connection) => (
          <Timeline.Item
            key={connection.connectionId}
            title={
              <Center>
                <Text truncate size="xs" sx={{ fontFamily: monospaceFontFamily }}>
                  {connection.peer}
                </Text>
              </Center>
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
                Not linked. Invite or join someone.
              </Text>
            </div>
          }
          bullet={<IconLinkOff size={12} />}
          lineVariant="dashed"
        />
      )}
    </Timeline>
  );
}
