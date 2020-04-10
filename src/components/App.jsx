import React from 'react';
import { Link } from 'react-router-dom';

export default class AppWrapper extends React.Component {
  render() {
    return (
      <div className='app-container'>
        <Link to={'/'}>Home</Link>
        <Link to={'/about'}>About</Link>
        <Link to={'/about/subroute'}>Subcomponent</Link>
        <Link to={'/index1'}>Hi</Link>
        <Link to={'/hello'}>Hello</Link>
        {this.props.children}
      </div>
    )
  }
}