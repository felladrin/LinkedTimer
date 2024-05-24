import globals from "globals";
import pluginJs from "@eslint/js";
import pluginTs from "typescript-eslint";

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...pluginTs.configs.recommended,
];
