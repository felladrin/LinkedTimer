import { ColorScheme, ColorSchemeProvider, MantineProvider, Menu } from "@mantine/core";
import { useColorScheme, useLocalStorage } from "@mantine/hooks";
import { IconMoonStars, IconSun } from "@tabler/icons";
import { ReactNode } from "react";

export function MantineColorScheme({
  children,
  component,
}: {
  children?: ReactNode;
  component: "provider" | "menuItem";
}) {
  const preferredColorScheme = useColorScheme("dark");
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: preferredColorScheme,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  switch (component) {
    case "provider":
      return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
          <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
            {children}
          </MantineProvider>
        </ColorSchemeProvider>
      );
    case "menuItem":
      return (
        <Menu.Item
          icon={colorScheme === "dark" ? <IconSun size={14} /> : <IconMoonStars size={14} />}
          onClick={() => toggleColorScheme()}
        >
          {colorScheme === "dark" ? "Light" : "Dark"} mode
        </Menu.Item>
      );
    default:
      return <></>;
  }
}
