import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Subcomponent from './Subcomponent';
import Data from './Data';
import './styles/chart.css';

const Chart = (props) => (
  <div className='chart'>
    <Data data={props.location.data}/>
    <Switch>
      <Route path='/about/subroute' component={Subcomponent} />
    </Switch>
  </div>
)

export default Chart;