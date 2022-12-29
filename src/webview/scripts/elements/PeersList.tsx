import { Accordion, Timeline } from "@mantine/core";
import { IconLink, IconLinkOff } from "@tabler/icons";
import { usePubSub } from "create-pubsub/react";
import { peerConnectionsPubSub } from "../controllers/peerController";

export function PeersList() {
  const [peerConnections] = usePubSub(peerConnectionsPubSub);

  return (
    <Accordion.Item value={PeersList.name}>
      <Accordion.Control>Timers linked</Accordion.Control>
      <Accordion.Panel>
        <Timeline active={peerConnections.length - 1} bulletSize={18} lineWidth={2}>
          {peerConnections.length > 0 ? (
            peerConnections.map((connection) => (
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
