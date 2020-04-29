import React from 'react';
import { Route, Switch } from 'react-router-dom';
import App from './components/App';
import Home from './components/Home';
import Chart from './components/Chart';
import Select from './components/Select';

const routes = (
  <App>
    <Switch>
      <Route exact path='/' component={Home} />
      <Route path='/chart' component={Chart} />
      <Route path='/select' component={Select} />
    </Switch>
  </App>
)

export { routes };