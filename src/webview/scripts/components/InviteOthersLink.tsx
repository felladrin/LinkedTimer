import { PeerContext } from "../constants";
import { useContext, useEffect, useState } from "react";
import { Accordion, ActionIcon, CopyButton, Input, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons";

export function InviteOthersLink() {
  const [peer, isPeerOpen] = useContext(PeerContext);
  const [addressToJoin, setAddressToJoin] = useState("");

  useEffect(() => {
    if (isPeerOpen) setAddressToJoin(peer.id);
  }, [peer, isPeerOpen]);

  return (
    <Accordion.Item value={InviteOthersLink.name}>
      <Accordion.Control>Invite others to join!</Accordion.Control>
      <Accordion.Panel>
        <Input
          value={addressToJoin}
          readOnly
          rightSection={
            <CopyButton value={addressToJoin} timeout={2000}>
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
      </Accordion.Panel>
    </Accordion.Item>
  );
}
