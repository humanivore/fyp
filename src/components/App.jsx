import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';


export default class AppWrapper extends React.Component {
  render() {
    return (
      <div className='app-container'>
        <Navbar bg="light" expand="lg">
        <Navbar.Brand href="/">SGData</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="https://data.gov.sg/">data.gov.sg</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        </Navbar>
        {this.props.children}
      </div>
    )
  }
}