import { ActionIcon, Group, Menu, Title } from "@mantine/core";
import { IconBrandGithub, IconBrandVscode, IconMenu2, IconMoonStars, IconSun, IconVersions } from "@tabler/icons";
import { displayName, repository } from "../../../../package.json";
import { isRunningInBrowser } from "../constants/booleans";
import { changelogUrl, vsCodeMarketplaceUrl } from "../constants/strings";
import { useColorSchemeFromLocalStorage } from "./hooks/useColorSchemeFromLocalStorage";

export function TopBar() {
  const [colorScheme, toggleColorScheme] = useColorSchemeFromLocalStorage();

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
          <Menu.Item
            icon={colorScheme === "dark" ? <IconSun size={14} /> : <IconMoonStars size={14} />}
            onClick={() => toggleColorScheme()}
          >
            {colorScheme === "dark" ? "Light" : "Dark"} mode
          </Menu.Item>
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
