import { ActionIcon, CopyButton, TextInput, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons";
import { usePubSub } from "create-pubsub/react";
import { roomIdPubSub } from "../constants/room";
import { monospaceFontFamily } from "../constants/strings";

export function InviteInput() {
  const [inviteId] = usePubSub(roomIdPubSub);

  return (
    <TextInput
      value={inviteId}
      size="xs"
      sx={{ fontFamily: monospaceFontFamily }}
      readOnly
      description="Ask people to join using this ID."
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
