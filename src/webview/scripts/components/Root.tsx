import { Enable, Features, ToggleFeatures } from "react-enable";
import {
  extensionName,
  features,
  isRunningInBrowser,
  isRunningInDevEnvironment,
  vsCodeMarketplaceUrl
} from "../constants";
import { TabTitleManager } from "./TabTitleManager";
import { NotificationManager } from "./NotificationManager";
import { LocalStorageManager } from "./LocalStorageManager";
import {
  Accordion,
  ActionIcon,
  Card,
  ColorScheme,
  ColorSchemeProvider,
  Container,
  Group,
  MantineProvider,
  Menu,
  Title
} from "@mantine/core";
import { useColorScheme, useLocalStorage } from "@mantine/hooks";
import { IconDots, IconExternalLink, IconMoonStars, IconSun } from "@tabler/icons";
import { PeerManager } from "./PeerManager";
import { TimerScreen } from "./TimerScreen";
import { TimerManager } from "./TimerManager";
import { PeersList } from "./PeersList";
import { InviteOthersLink } from "./InviteOthersLink";
import { JoinOthersForm } from "./JoinOthersForm";

export function Root() {
  const preferredColorScheme = useColorScheme("dark");
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: preferredColorScheme,
    getInitialValueInEffect: true
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  return (
    <>
      <TimerManager />
      <PeerManager />
      <Features features={features}>
        {isRunningInDevEnvironment && <ToggleFeatures />}
        <Enable feature={TabTitleManager.name}>
          <TabTitleManager />
        </Enable>
        <Enable feature={NotificationManager.name}>
          <NotificationManager />
        </Enable>
        <Enable feature={LocalStorageManager.name}>
          <LocalStorageManager />
        </Enable>
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
          <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
            <Container size={482} py="xs">
              <Card withBorder radius="md">
                <Card.Section withBorder inheritPadding py="xs">
                  <Group position="apart">
                    <Title order={3} align="center">
                      {extensionName}
                    </Title>
                    <Menu withinPortal position="bottom-end" shadow="sm">
                      <Menu.Target>
                        <ActionIcon>
                          <IconDots size={24} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item icon={colorScheme === "dark" ? <IconSun size={14} /> : <IconMoonStars size={14} />}
                                   onClick={() => toggleColorScheme()}>
                          Toggle Color Scheme
                        </Menu.Item>
                        {isRunningInBrowser && (<Menu.Item icon={<IconExternalLink size={14} />} component="a"
                                                           target="_blank"
                                                           rel="noopener noreferrer"
                                                           href={vsCodeMarketplaceUrl}>
                          Install on VS Code
                        </Menu.Item>)}
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Card.Section>
                <Card.Section>
                  <TimerScreen />
                </Card.Section>
                <Card.Section>
                  <Accordion chevronPosition="left">
                    <PeersList />
                    <InviteOthersLink />
                    <JoinOthersForm />
                  </Accordion>
                </Card.Section>
              </Card>
            </Container>
          </MantineProvider>
        </ColorSchemeProvider>
      </Features>
    </>
  );
}
