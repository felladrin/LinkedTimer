import { Card, ColorSchemeProvider, Container, MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { appWidth } from "../constants/numbers";
import { ActionTabs } from "./ActionTabs";
import { useColorSchemeFromLocalStorage } from "./hooks/useColorSchemeFromLocalStorage";
import { Timer } from "./Timer";
import { TopBar } from "./TopBar";

export function Root() {
  const [colorScheme, toggleColorScheme] = useColorSchemeFromLocalStorage();

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
        <NotificationsProvider>
          <Container size={appWidth} py="xs">
            <Card withBorder radius="md">
              <Card.Section withBorder inheritPadding py="xs">
                <TopBar />
              </Card.Section>
              <Card.Section>
                <Timer />
              </Card.Section>
              <Card.Section>
                <ActionTabs />
              </Card.Section>
            </Card>
          </Container>
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
