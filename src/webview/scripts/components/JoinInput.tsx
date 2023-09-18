import { ActionIcon, LoadingOverlay, TextInput, Tooltip } from "@mantine/core";
import { getHotkeyHandler } from "@mantine/hooks";
import { IconPlugConnected } from "@tabler/icons-react";
import { usePubSub } from "create-pubsub/react";
import { useEffect, useState } from "react";
import { roomPeersIdsPubSub, connectToRoom } from "../constants/room";
import { monospaceFontFamily } from "../constants/strings";

export function JoinInput() {
  const [idToJoin, setTimerIdToJoin] = useState("");
  const [isLoadingOverlayVisible, setLoadingOverlayVisible] = useState(false);
  const [roomPeersIds] = usePubSub(roomPeersIdsPubSub);

  useEffect(() => {
    setTimerIdToJoin("");
    setLoadingOverlayVisible(false);
  }, [roomPeersIds]);

  const connect = () => {
    connectToRoom(idToJoin);
    setLoadingOverlayVisible(true);
  };

  return (
    <>
      <LoadingOverlay visible={isLoadingOverlayVisible} overlayProps={{ blur: 2 }} />
      <TextInput
        placeholder="ID to Join"
        description="Received an ID to join? Insert it below."
        value={idToJoin}
        onChange={({ currentTarget }) => setTimerIdToJoin(currentTarget.value.trim())}
        onKeyDown={getHotkeyHandler([["Enter", connect]])}
        size="xs"
        style={{ fontFamily: monospaceFontFamily }}
        rightSection={
          <Tooltip label="Join" position="left">
            <ActionIcon onClick={connect} variant="subtle" color="gray">
              <IconPlugConnected size={16} />
            </ActionIcon>
          </Tooltip>
        }
      />
    </>
  );
}
