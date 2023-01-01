import { ActionIcon, TextInput, Tooltip } from "@mantine/core";
import { getHotkeyHandler } from "@mantine/hooks";
import { IconPlugConnected } from "@tabler/icons";
import { usePubSub } from "create-pubsub/react";
import { useEffect, useState } from "react";
import { connectToPeer } from "../commands/connectToPeer";
import { peerConnectionsPubSub } from "../constants/peer";

export function JoinInput() {
  const [idToJoin, setTimerIdToJoin] = useState("");
  const [peerConnections] = usePubSub(peerConnectionsPubSub);

  useEffect(() => {
    if (peerConnections.find(({ peer }) => peer === idToJoin)) setTimerIdToJoin("");
  }, [idToJoin, peerConnections]);

  const connect = () => connectToPeer(idToJoin);

  return (
    <TextInput
      placeholder="ID to Join"
      description="Received an ID to join? Insert it below."
      value={idToJoin}
      onChange={({ currentTarget }) => setTimerIdToJoin(currentTarget.value.trim())}
      onKeyDown={getHotkeyHandler([["Enter", connect]])}
      rightSection={
        <Tooltip label="Join" position="left">
          <ActionIcon onClick={connect}>
            <IconPlugConnected size={16} />
          </ActionIcon>
        </Tooltip>
      }
    />
  );
}
