import { ActionIcon, CopyButton, TextInput, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { usePubSub } from "create-pubsub/react";
import { roomPubSub } from "../constants/room";
import { monospaceFontFamily } from "../constants/strings";

export function InviteInput() {
  const [room] = usePubSub(roomPubSub);

  return (
    <TextInput
      value={room?.id ?? ""}
      size="xs"
      style={{ fontFamily: monospaceFontFamily }}
      readOnly
      description="Ask people to join using this ID."
      rightSection={
        <CopyButton value={room?.id ?? ""} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? "Copied" : "Copy"} withArrow position="right">
              <ActionIcon color={copied ? "teal" : "gray"} onClick={copy} variant="subtle">
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
      }
    />
  );
}
