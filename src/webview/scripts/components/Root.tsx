import { Card, Container } from "@mantine/core";
import { Timer } from "./Timer";
import { Mantine } from "./Mantine";
import { ActionTabs } from "./ActionTabs";
import { TopBar } from "./TopBar";

export function Root() {
  return (
    <Mantine component="provider">
      <Container size={375} py="xs">
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
    </Mantine>
  );
}
