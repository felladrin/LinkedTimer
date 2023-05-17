import { ActionIcon, Menu, TextInput, Tooltip, Text, Grid } from "@mantine/core";
import { IconBrandGithub, IconBrandVscode, IconMenu2, IconMoonStars, IconSun, IconVersions } from "@tabler/icons-react";
import { displayName, repository } from "../../../../package.json";
import { isRunningInBrowser } from "../constants/booleans";
import { changelogUrl, vsCodeMarketplaceUrl } from "../constants/strings";
import { useColorSchemeFromLocalStorage } from "./hooks/useColorSchemeFromLocalStorage";
import { CSSProperties, useState } from "react";

export function TopBar() {
  const [colorScheme, toggleColorScheme] = useColorSchemeFromLocalStorage();

  return (
    <Grid align="center" justify="space-between">
      <Grid.Col span={10}>
        <EditableTimerName fontSize="1.375rem" fontWeight="bold" lineHeight="1.65" height="36px" />
      </Grid.Col>
      <Grid.Col span="content">
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
      </Grid.Col>
    </Grid>
  );
}

function EditableTimerName({
  fontSize,
  fontWeight,
  lineHeight,
  height,
}: {
  fontSize: CSSProperties["fontSize"];
  fontWeight: CSSProperties["fontWeight"];
  lineHeight: CSSProperties["lineHeight"];
  height: CSSProperties["height"];
}) {
  const [isEditing, setEditing] = useState(false);
  const [currentText, setText] = useState(displayName);

  const submit = () => {
    const newText = currentText.trim();
    setText(newText.length > 0 ? newText : displayName);
    setEditing(false);
  };

  return isEditing ? (
    <TextInput
      placeholder={displayName}
      value={currentText}
      autoFocus
      variant="unstyled"
      styles={{
        input: {
          padding: "0",
          // @ts-expect-error - Types don't match.
          fontWeight,
          fontSize,
          lineHeight,
          height,
        },
      }}
      onChange={({ currentTarget }) => setText(currentTarget.value)}
      onBlur={submit}
      onKeyDown={(event) => {
        if (event.key === "Enter") submit();
      }}
    />
  ) : (
    <Tooltip
      label={"Click to rename this timer"}
      color="blue"
      position="bottom-start"
      withArrow
      transitionProps={{ transition: "pop", duration: 300 }}
    >
      <Text size={fontSize} fw={fontWeight} lh={lineHeight} h={height} onClick={() => setEditing(true)} truncate>
        {currentText}
      </Text>
    </Tooltip>
  );
}
