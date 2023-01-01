import { appName, vsCodeMarketplaceUrl } from "../constants/strings";
import { isRunningInBrowser } from "../constants/booleans";
import { ActionIcon, Group, Menu, Title } from "@mantine/core";
import { IconExternalLink, IconMenu2 } from "@tabler/icons";
import { Mantine } from "./Mantine";

export function TopBar() {
  return (
    <Group position="apart">
      <Title order={3}>{appName}</Title>
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
  );
}
