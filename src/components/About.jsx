import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Subcomponent from './Subcomponent';
import Options from './Options'
import DataSelect from './DataSelect';

const About = (props) => (
  <div className='about'>
    <Options />
    <DataSelect />
    <Switch>
      <Route path='/about/subroute' component={Subcomponent} />
    </Switch>
  </div>
)

export default About;