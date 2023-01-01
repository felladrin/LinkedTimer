import { appName, vsCodeMarketplaceUrl } from "../constants/strings";
import { isRunningInBrowser } from "../constants/booleans";
import { ActionIcon, Card, Container, Group, Menu, Title } from "@mantine/core";
import { IconExternalLink, IconMenu2 } from "@tabler/icons";
import { TimerScreen } from "./TimerScreen";
import { Mantine } from "./Mantine";
import { ActionTabs } from "./ActionTabs";

export function Root() {
  return (
    <Mantine component="provider">
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
                    <IconMenu2 size={24} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Mantine component="menuItem" />
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
            <ActionTabs />
          </Card.Section>
        </Card>
      </Container>
    </Mantine>
  );
}
