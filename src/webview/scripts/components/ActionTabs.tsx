import { Tabs } from "@mantine/core";
import { IconBroadcast, IconLink, IconPlugConnected } from "@tabler/icons-react";
import { LinksList } from "./LinksList";
import { InviteInput } from "./InviteInput";
import { JoinInput } from "./JoinInput";
import { useEffect, useState } from "react";
import { usePubSub } from "create-pubsub/react";
import { roomPeersIdsPubSub } from "../constants/room";

export function ActionTabs() {
  const [activeTab, setActiveTab] = useState<string | null>(LinksList.name);
  const [roomPeersIds] = usePubSub(roomPeersIdsPubSub);

  useEffect(() => setActiveTab(LinksList.name), [roomPeersIds]);

  return (
    <Tabs value={activeTab} onChange={setActiveTab}>
      <Tabs.List grow>
        <Tabs.Tab value={LinksList.name} leftSection={<IconLink size={14} />}>
          Links
        </Tabs.Tab>
        <Tabs.Tab value={InviteInput.name} leftSection={<IconBroadcast size={14} />}>
          Invite
        </Tabs.Tab>
        <Tabs.Tab value={JoinInput.name} leftSection={<IconPlugConnected size={14} />}>
          Join
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value={LinksList.name} p="md" pb="xs">
        <LinksList />
      </Tabs.Panel>
      <Tabs.Panel value={InviteInput.name} p="md">
        <InviteInput />
      </Tabs.Panel>
      <Tabs.Panel value={JoinInput.name} p="md">
        <JoinInput />
      </Tabs.Panel>
    </Tabs>
  );
}
