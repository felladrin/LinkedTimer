import { appName, vsCodeMarketplaceUrl } from "../constants/strings";
import { isRunningInBrowser } from "../constants/booleans";
import { ActionIcon, Card, Container, Group, Menu, Tabs, Title } from "@mantine/core";
import { IconBroadcast, IconDots, IconExternalLink, IconLink, IconPlugConnected } from "@tabler/icons";
import { TimerScreen } from "./TimerScreen";
import { LinksList } from "./LinksList";
import { InviteInput } from "./InviteInput";
import { JoinInput } from "./JoinInput";
import { MantineColorScheme } from "./MantineColorScheme";

export function Root() {
  return (
    <MantineColorScheme component="provider">
      <Container size={482} py="xs">
        <Card withBorder radius="md">
          <Card.Section withBorder inheritPadding py="xs">
            <Group position="apart">
              <Title order={3} align="center">
                {appName}
              </Title>
              <Menu withinPortal position="bottom-end" shadow="sm">
                <Menu.Target>
                  <ActionIcon>
                    <IconDots size={24} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <MantineColorScheme component="menuItem" />
                  {isRunningInBrowser && (
                    <Menu.Item
                      icon={<IconExternalLink size={14} />}
                      component="a"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={vsCodeMarketplaceUrl}
                    >
                      Install on VS Code
                    </Menu.Item>
                  )}
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Card.Section>
          <Card.Section>
            <TimerScreen />
          </Card.Section>
          <Card.Section>
            <Tabs defaultValue={LinksList.name}>
              <Tabs.List grow>
                <Tabs.Tab value={LinksList.name} icon={<IconLink size={14} />}>
                  Links
                </Tabs.Tab>
                <Tabs.Tab value={InviteInput.name} icon={<IconBroadcast size={14} />}>
                  Invite
                </Tabs.Tab>
                <Tabs.Tab value={JoinInput.name} icon={<IconPlugConnected size={14} />}>
                  Join
                </Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value={LinksList.name} p="md">
                <LinksList />
              </Tabs.Panel>
              <Tabs.Panel value={InviteInput.name} p="md">
                <InviteInput />
              </Tabs.Panel>
              <Tabs.Panel value={JoinInput.name} p="md">
                <JoinInput />
              </Tabs.Panel>
            </Tabs>
          </Card.Section>
        </Card>
      </Container>
    </MantineColorScheme>
  );
}
