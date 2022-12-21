import { Accordion, ActionIcon, Input, Tooltip } from "@mantine/core";
import { IconPlugConnected } from "@tabler/icons";
import { usePubSub } from "create-pubsub/react";
import { MutableRefObject, useEffect, useRef } from "react";
import { connectionsPubSub, requestedPeerIdToConnectPubSub } from "../constants";

export function JoinOthersForm() {
  const [requestedPeerIdToConnect, setRequestedPeerIdToConnect] = usePubSub(requestedPeerIdToConnectPubSub);
  const [connections] = usePubSub(connectionsPubSub)
  const timerIdToJoin = useRef() as MutableRefObject<HTMLInputElement>;

  useEffect(() => {
    if (connections.findIndex(connection => connection.peer === requestedPeerIdToConnect) !== -1) {
      timerIdToJoin.current.value = ""
    }
  }, [connections, requestedPeerIdToConnect])

  return (
    <Accordion.Item value={JoinOthersForm.name}>
      <Accordion.Control>Join others!</Accordion.Control>
      <Accordion.Panel>
        <Input
          placeholder="ID to connect"
          ref={timerIdToJoin}
          rightSection={
            <Tooltip label="Connect" position="left">
              <ActionIcon onClick={() => setRequestedPeerIdToConnect(timerIdToJoin.current.value)}>
                <IconPlugConnected size={16} />
              </ActionIcon>
            </Tooltip>
          }
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
}
