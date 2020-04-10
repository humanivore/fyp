import React, { Component } from 'react';
import Chart from "react-apexcharts";


class Data extends Component {
    constructor() {
        super();
        this.state = {
            data: [],
            apex: {
                options: {
                    chart: {
                      id: "basic-bar"
                    },
                    xaxis: {
                        type: 'numeric'
                    }
                },
            },
            series: [],
        };
    };

    fetchAndDisplay() {
        if (this.props.resource.length > 1) {
            // CODE
        } else {
            fetch(`http://localhost:7082/api/data?resource_id=${this.props.resource}`, { method: 'get', mode: 'cors' })
            .then(results =>
                {
                    var ans = results.json()
                    console.log(ans)
                    return ans
                }
            )
            .then(data1 => {
                console.log("data2", data1);
                this.setState({data: data1})
                console.log("state", this.state.data);
                var seriesData = []
                this.state.data.forEach(element => {
                    var item = {}
                    item['x'] = this.findKey(element, 'year');
                    item['y'] = this.findKey(element, 'enrolment');
                    seriesData.push(item);
                })
                var series = [{
                    name: "Enrolment - MOE Kindergartens",
                    data: seriesData,
                }]
                this.setState({series: series})
                console.log("series", this.state.series.data);
            });
        }
    }

    findKey(element, keyword) {
        for(var key in element) {
            if(key.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
                return element[key];
            }
        }
    }

    componentDidUpdate(prevProps) {
        console.log('props.resource', this.props.resource);
        if (this.props.resource !== prevProps.resource) {
            this.fetchAndDisplay();
        }
    }
    
    render() {
        return (
            <div className="chart">
                {/* {this.state.data} */}
                <Chart
              options={this.state.apex.options}
              series={this.state.series}
              type="bar"
              width="500"
            />
            </div>
        )
    }
}

export default Data;