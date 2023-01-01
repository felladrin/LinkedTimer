import { ActionIcon, TextInput, Tooltip } from "@mantine/core";
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

  return (
    <TextInput
      placeholder="ID to Join"
      description="Has received an ID to join? Insert it here:"
      value={idToJoin}
      onChange={({ currentTarget }) => setTimerIdToJoin(currentTarget.value.trim())}
      rightSection={
        <Tooltip label="Join" position="left">
          <ActionIcon onClick={() => connectToPeer(idToJoin)}>
            <IconPlugConnected size={16} />
          </ActionIcon>
        </Tooltip>
      }
    />
  );
}
