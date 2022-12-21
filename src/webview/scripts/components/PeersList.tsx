import { Accordion, Timeline } from "@mantine/core";
import { IconLink, IconLinkOff } from "@tabler/icons";
import { usePubSub } from "create-pubsub/react";
import { connectionsPubSub } from "../constants";

export function PeersList() {
  const [connections] = usePubSub(connectionsPubSub);

  return (
    <Accordion.Item value={PeersList.name}>
      <Accordion.Control>Timers linked</Accordion.Control>
      <Accordion.Panel>
        <Timeline active={connections.length - 1} bulletSize={18} lineWidth={2}>
          {connections.length > 0 ? (
            connections.map((connection) => (
              <Timeline.Item
                key={connection.connectionId}
                title={connection.peer}
                bullet={<IconLink size={12} />}
                lineVariant="dashed"
              />
            ))
          ) : (
            <Timeline.Item title="None yet" bullet={<IconLinkOff size={12} />} lineVariant="dashed" />
          )}
        </Timeline>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
