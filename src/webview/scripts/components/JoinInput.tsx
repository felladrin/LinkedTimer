import { ActionIcon, Input, Tooltip } from "@mantine/core";
import { IconPlugConnected } from "@tabler/icons";
import { useState } from "react";
import { connectToPeer } from "../commands/connectToPeer";

export function JoinInput() {
  const [idToJoin, setTimerIdToJoin] = useState("");

  return (
    <Input
      placeholder="ID to Join"
      value={idToJoin}
      onChange={({ currentTarget }) => setTimerIdToJoin(currentTarget.value.trim())}
      rightSection={
        <Tooltip label="Join" position="left">
          <ActionIcon
            onClick={() => {
              connectToPeer(idToJoin);
              setTimerIdToJoin("");
            }}
          >
            <IconPlugConnected size={16} />
          </ActionIcon>
        </Tooltip>
      }
    />
  );
}
