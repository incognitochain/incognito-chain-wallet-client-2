import React from "react";
import { Switch, Route } from "react-router-dom";
import { Password } from "./modules/password/Password";

export function AppRoute() {
  return (
    <Switch>
      <Route path="/password" exact component={Password} />
    </Switch>
  );
}
