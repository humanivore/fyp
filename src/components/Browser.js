import React, { Component } from 'react';
import database from '../../server/db.json';
import Datasets from './Datasets';

class Browser extends Component {
    constructor() {
        super();
        this.state = {
            datasets: [],
            filtered: [],
            selected: [],
        };
    };

    componentDidMount() {
        this.setState({
          database,
          datasets: database
        })
    }

    filterData = (filter) => {
        filter = filter.split(' ')
        let filtered = this.state.datasets
        filter.forEach(word => {
            filtered = filtered.filter((dataset) => {
                let dataName = dataset.name.toLowerCase()
                return dataName.indexOf(
                  word.toLowerCase()) !== -1
              })
        });
        this.setState({
          filtered: filtered
        })
      }

    render(){
        return (
            <div>
                <Datasets data={this.state.filtered} match={this.props.match} onChange={this.filterData} />
            </div>
        );
    }
}

export default Browser;