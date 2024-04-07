import React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import ScopedCssBaseline from "@mui/joy/ScopedCssBaseline";
import { App } from "./app";

export const Main = () => {
  const [root, setRoot] = React.useState(null);
  return (
    <CssVarsProvider colorSchemeNode={root}>
      {/* must be used under CssVarsProvider */}
      <ScopedCssBaseline ref={(element) => setRoot(element)}>
        <App />
      </ScopedCssBaseline>
    </CssVarsProvider>
  );
};
