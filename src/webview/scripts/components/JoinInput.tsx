import { ActionIcon, LoadingOverlay, TextInput, Tooltip } from "@mantine/core";
import { getHotkeyHandler } from "@mantine/hooks";
import { IconPlugConnected } from "@tabler/icons-react";
import { usePubSub } from "create-pubsub/react";
import { useEffect, useRef, useState } from "react";
import { roomPeersIdsPubSub, connectToRoom } from "../constants/room";
import { monospaceFontFamily } from "../constants/strings";

const JOIN_TIMEOUT_MS = 15_000;

export function JoinInput() {
  const [idToJoin, setTimerIdToJoin] = useState("");
  const [isLoadingOverlayVisible, setLoadingOverlayVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roomPeersIds] = usePubSub(roomPeersIdsPubSub);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setTimerIdToJoin("");
    setLoadingOverlayVisible(false);
    setErrorMessage(null);
  }, [roomPeersIds]);

  const connect = () => {
    setErrorMessage(null);
    connectToRoom(idToJoin);
    setLoadingOverlayVisible(true);
    timeoutRef.current = setTimeout(() => {
      setLoadingOverlayVisible(false);
      setErrorMessage("No timer found with that ID. Make sure it's still active.");
      timeoutRef.current = null;
    }, JOIN_TIMEOUT_MS);
  };

  return (
    <>
      <LoadingOverlay visible={isLoadingOverlayVisible} overlayProps={{ blur: 2 }} />
      <TextInput
        placeholder="ID to Join"
        description="Received an ID to join? Insert it below."
        value={idToJoin}
        onChange={({ currentTarget }) => {
          setTimerIdToJoin(currentTarget.value.trim());
          setErrorMessage(null);
        }}
        onKeyDown={getHotkeyHandler([["Enter", connect]])}
        size="xs"
        style={{ fontFamily: monospaceFontFamily }}
        error={errorMessage}
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
