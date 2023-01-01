import { ActionIcon, CopyButton, TextInput, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons";
import { usePubSub } from "create-pubsub/react";
import { peerPubSub } from "../constants/peer";

export function InviteInput() {
  const [peer] = usePubSub(peerPubSub);

  const inviteId = peer ? peer.id : "Loading...";

  return (
    <TextInput
      value={inviteId}
      readOnly
      description="Ask people to join using the following ID:"
      rightSection={
        <CopyButton value={inviteId} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? "Copied" : "Copy"} withArrow position="right">
              <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
      }
    />
  );
}
