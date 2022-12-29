import { Accordion, ActionIcon, Input, Tooltip } from "@mantine/core";
import { IconPlugConnected } from "@tabler/icons";
import { useState } from "react";
import { connectToPeer } from "../controllers/peerController";

export function JoinOthersForm() {
  const [timerIdToJoin, setTimerIdToJoin] = useState("");

  return (
    <Accordion.Item value={JoinOthersForm.name}>
      <Accordion.Control>Join others!</Accordion.Control>
      <Accordion.Panel>
        <Input
          placeholder="ID to connect"
          onChange={({ currentTarget }) => setTimerIdToJoin(currentTarget.value)}
          rightSection={
            <Tooltip label="Connect" position="left">
              <ActionIcon onClick={() => connectToPeer(timerIdToJoin)}>
                <IconPlugConnected size={16} />
              </ActionIcon>
            </Tooltip>
          }
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
}
