import React, { Component } from 'react';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';

class FilterForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filter: ""
    }
  }
  
  handleChange = (e) => {
    this.setState({filter: e.target.value})
    this.props.onChange(event.target.value)
  }
  
  render() {
    return (
      <div>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text id="search">Search</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            aria-label="Default"
            aria-describedby="search"
            placeholder="Start typing to search for datasets!"
            id="filter"
            value={this.state.filter}
            onChange={this.handleChange}
          />
        </InputGroup>
        {/* <label htmlFor="filter">Search </label>
        <input type="text" id="filter" 
          value={this.state.filter} 
          onChange={this.handleChange}/> */}
      </div>
      )
  }
}

export default FilterForm