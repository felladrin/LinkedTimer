import { changelogUrl, vsCodeMarketplaceUrl } from "../constants/strings";
import { isRunningInBrowser } from "../constants/booleans";
import { ActionIcon, Group, Menu, Title } from "@mantine/core";
import { IconBrandGithub, IconBrandVscode, IconMenu2, IconVersions } from "@tabler/icons";
import { Mantine } from "./Mantine";
import { repository, displayName } from "../../../../package.json";

export function TopBar() {
  return (
    <Group position="apart">
      <Title order={3}>{displayName}</Title>
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
              icon={<IconBrandVscode size={14} />}
              component="a"
              target="_blank"
              rel="noopener noreferrer"
              href={vsCodeMarketplaceUrl}
            >
              VS Code extension
            </Menu.Item>
          )}
          <Menu.Item
            icon={<IconBrandGithub size={14} />}
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            href={repository.url}
          >
            Source code
          </Menu.Item>
          <Menu.Item
            icon={<IconVersions size={14} />}
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            href={changelogUrl}
          >
            Changelog
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
