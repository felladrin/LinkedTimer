import { ColorScheme } from "@mantine/core";
import { useColorScheme, useLocalStorage } from "@mantine/hooks";

export function useColorSchemeFromLocalStorage(): [ColorScheme, (colorScheme?: ColorScheme | undefined) => void] {
  const preferredColorScheme = useColorScheme("dark");
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: preferredColorScheme,
  });

  const toggleColorScheme: (colorScheme?: ColorScheme | undefined) => void = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  return [colorScheme, toggleColorScheme];
}
