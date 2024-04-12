import React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import ScopedCssBaseline from "@mui/joy/ScopedCssBaseline";
import { App } from "./app";
import { getAuth } from "firebase/auth";
import * as firebaseui from "firebaseui";

export const Main = ({ authUI }: { authUI: firebaseui.auth.AuthUI }) => {
  const [root, setRoot] = React.useState(null);
  return (
    <CssVarsProvider colorSchemeNode={root}>
      {/* must be used under CssVarsProvider */}
      <ScopedCssBaseline ref={(element) => setRoot(element)}>
        <App authUI={authUI}/>
      </ScopedCssBaseline>
    </CssVarsProvider>
  );
};
