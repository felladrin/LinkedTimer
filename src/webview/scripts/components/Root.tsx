import { Card, ColorSchemeProvider, Container, MantineProvider } from "@mantine/core";
import { appWidth } from "../constants/numbers";
import { ActionTabs } from "./ActionTabs";
import { useColorSchemeFromLocalStorage } from "./hooks/useColorSchemeFromLocalStorage";
import { Timer } from "./Timer";
import { TopBar } from "./TopBar";
import { NoWebRtcSupportModal } from "./NoWebRtcSupportModal";

export function Root() {
  const [colorScheme, toggleColorScheme] = useColorSchemeFromLocalStorage();

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
        <Container style={{height: "100vh", display: "flex", alignItems: "center"}} size={appWidth} py="xs">
          <NoWebRtcSupportModal />
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
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
