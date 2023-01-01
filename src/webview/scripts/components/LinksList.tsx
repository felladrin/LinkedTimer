import { Timeline } from "@mantine/core";
import { IconLink, IconLinkOff } from "@tabler/icons";
import { usePubSub } from "create-pubsub/react";
import { peerConnectionsPubSub } from "../constants/peer";

export function LinksList() {
  const [peerConnections] = usePubSub(peerConnectionsPubSub);

  return (
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
        <Timeline.Item
          title="None yet. Start by inviting or joining someone."
          bullet={<IconLinkOff size={12} />}
          lineVariant="dashed"
        />
      )}
    </Timeline>
  );
}
