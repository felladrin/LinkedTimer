import { vsCodeMarketplaceUrl } from "../controllers/vsCodeController";
import { appName, isRunningInBrowser } from "../controllers/appController";
import { Accordion, ActionIcon, Card, Container, Group, Menu, Title } from "@mantine/core";
import { IconDots, IconExternalLink } from "@tabler/icons";
import { TimerScreen } from "./TimerScreen";
import { PeersList } from "./PeersList";
import { InviteOthersLink } from "./InviteOthersLink";
import { JoinOthersForm } from "./JoinOthersForm";
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
            <Accordion chevronPosition="left" multiple={true}>
              <PeersList />
              <InviteOthersLink />
              <JoinOthersForm />
            </Accordion>
          </Card.Section>
        </Card>
      </Container>
    </MantineColorScheme>
  );
}
