import { ActionIcon, TextInput, Tooltip } from "@mantine/core";
import { getHotkeyHandler } from "@mantine/hooks";
import { IconPlugConnected } from "@tabler/icons";
import { usePubSub } from "create-pubsub/react";
import { useEffect, useState } from "react";
import { roomPeersPubSub, connectToRoom } from "../constants/room";
import { monospaceFontFamily } from "../constants/strings";

export function JoinInput() {
  const [idToJoin, setTimerIdToJoin] = useState("");
  const [roomPeers] = usePubSub(roomPeersPubSub);

  useEffect(() => setTimerIdToJoin(""), [roomPeers]);

  const connect = () => connectToRoom(idToJoin);

  return (
    <TextInput
      placeholder="ID to Join"
      description="Received an ID to join? Insert it below."
      value={idToJoin}
      onChange={({ currentTarget }) => setTimerIdToJoin(currentTarget.value.trim())}
      onKeyDown={getHotkeyHandler([["Enter", connect]])}
      size="xs"
      sx={{ fontFamily: monospaceFontFamily }}
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
