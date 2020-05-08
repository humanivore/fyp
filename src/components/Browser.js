import React, { Component } from 'react';
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
        let database = []
        let resources = []

        fetch("https://data.gov.sg/api/action/datastore_search?resource_id=85be5dcc-93f6-4d36-ae10-c85b0907948c", { 
            method: 'get', 
            mode: 'cors'
        }).then(response => {
            let respJson = response.json()
            console.log("response", respJson);
            return respJson
        }).then(respJson => {
            let limit = respJson.result.total
            console.log(limit);
            fetch(`https://data.gov.sg/api/action/datastore_search?resource_id=85be5dcc-93f6-4d36-ae10-c85b0907948c&limit=${limit}`, { 
                method: 'get', 
                mode: 'cors'
            }).then(resp => {
                let recordJson = resp.json()
                return recordJson
            }).then(recordJson => {
                let records = recordJson.result.records
                records.forEach(record => {
                    let newRecord = {}
                    newRecord['name'] = record['resource_name']
                    newRecord['id'] = record['resource_id']
                    newRecord['description'] = record['description']
                    if(!resources.includes(record['resource_id'])){
                        database.push(newRecord)
                        resources.push(record['resource_id'])
                    }
                })
            })
        })
        console.log("database", database);
        this.setState({datasets: database})
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