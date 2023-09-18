import { Card, Container, MantineProvider } from "@mantine/core";
import { appWidth } from "../constants/numbers";
import { ActionTabs } from "./ActionTabs";
import { Timer } from "./Timer";
import { TopBar } from "./TopBar";
import { NoWebRtcSupportModal } from "./NoWebRtcSupportModal";
import { useViewportSize } from "@mantine/hooks";

export function Root() {
  const { height } = useViewportSize();

  return (
    <MantineProvider defaultColorScheme="dark">
      <Container
        display="flex"
        style={{ alignItems: "center", justifyContent: "center" }}
        h={height}
        miw={appWidth}
        size={appWidth}
      >
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
  );
}
