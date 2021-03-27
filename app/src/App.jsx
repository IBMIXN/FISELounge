import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import theme from "./theme";
import { ThemeProvider, CSSReset } from "@chakra-ui/core";

import Main from "./pages/Main";
import Onboarding from "./pages/Onboarding";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CSSReset />
      <Router>
        <Switch>
          <Route path="/logout">
            <Logout />
          </Route>
          <Route path="/onboarding">
            <Onboarding />
          </Route>
          <Route path="/">
            <Main />
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

const Logout = () => {
  localStorage.setItem("otc", "");
  localStorage.setItem("user", "");
  return <Redirect to="/onboarding" />;
};
