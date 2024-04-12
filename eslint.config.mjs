import globals from "globals";
import pluginJs from "@eslint/js";
import pluginTs from "typescript-eslint";
import pluginReact from "eslint-plugin-react/configs/recommended.js";

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...pluginTs.configs.recommended,
  {
    ...pluginReact,
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...pluginReact.rules,
      "react/react-in-jsx-scope": "off",
    },
  },
];
