import React, { Component } from 'react';
import Chart from "react-apexcharts";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup'
import Switch from '@material-ui/core/Switch';
import './Styles/chart.css';


class Data extends Component {
    constructor() {
        super();
        this.handleChartType = this.handleChartType.bind(this);
        this.handleDisplayToggle = this.handleDisplayToggle.bind(this);
        this.handleRender = this.handleRender.bind(this);
        this.state = {
            loaded: false,
            options: {},
            series: [],
        };
        this.config = []
    };

    fetchAndDisplay() {
        if (this.props.data.length > 0) {
            let ids = []
            this.props.data.forEach(dataset =>
                ids.push(dataset["id"]))
            let idString = ids.join()
            fetch(`http://localhost:7082/api/data?resource_id=${idString}`, { 
                method: 'post', 
                mode: 'cors',
                headers: new Headers({'Content-Type': 'application/json'}),
                body: JSON.stringify({data: this.props.data})
            })
            .then(results =>
                {
                    var data = results.json()
                    console.log(data)
                    return data
                }
            ).then(result =>
                {
                    let chartData = result.data
                    if('datetime' in chartData){
                        let x = []
                        let seriesData = []
                        for(const [k, v] of Object.entries(chartData)){
                            if (k == 'datetime'){
                                continue
                            } else if (k == chartData.datetime){
                                x = v
                            } else {
                                seriesData.push({
                                    name: k,
                                    type: "line",
                                    data: v
                                })
                            }
                        }
                        let options = {
                            xaxis: {
                                categories: x
                            }
                        }
                        console.log("options", options);
                        console.log("series", seriesData);
                        this.setState({options: options})
                        this.setState({series: seriesData})

                        seriesData.forEach(series => {
                            series['display'] = true
                            this.config.push(series)
                        })
                        this.setState({loaded: true})
                    }
                }
            )
        }
    }

    // componentDidUpdate(prevProps) {
    //     console.log('props.resource', this.props.resource);
    //     if (this.props.resource !== prevProps.resource) {
    //         this.fetchAndDisplay();
    //     }
    // }

    handleDisplayToggle(e) {
        console.log("e", e.target.value);
        this.config.forEach(series => {
            if(series.name == e.target.value){
                if(series.display){
                    series.display = false
                } else {
                    series.display = true
                }
            }
        })
    }

    handleChartType(e) {
        console.log("target", e.target);
        this.config.forEach(series => {
            if(series.name == e.target.name){
                series.type = e.target.value
            }
        })
        console.log("config", this.config);
    }

    handleRender() {
        console.log("I'm here");
        let configToPass = []
        this.config.forEach(e => {
            if(e.display){
                configToPass.push(e)
            }
        })
        this.setState({series: configToPass})
        console.log("series", this.state.series)
    }

    componentDidMount() {
        try {
            this.fetchAndDisplay();
        } catch(err) {

        }
    }

    showConfig = () => {
        let form = []
        this.config.forEach(data => {
            let config = []
            config.push(<h5>{data.name}</h5>)
            config.push(<Form.Label><h6>Display</h6></Form.Label>)
            config.push(<span>Off </span>)
            config.push(<Switch defaultChecked value={data.name} onChange={this.handleDisplayToggle} />)
            config.push(<span> On</span>)
            config.push(<Form.Label><h6>Chart Type</h6></Form.Label>)
            config.push(<RadioGroup class="chart-type" name={data.name} defaultValue="line" onChange={this.handleChartType}>
            <FormControlLabel value="line" control={<Radio />} label="Line" />
            <FormControlLabel value="column" control={<Radio />} label="Column" />
            <FormControlLabel value="area" control={<Radio />} label="Area" />
            </RadioGroup>)
            form.push(<Form.Group>{config}</Form.Group>)
        })
        form.push(<Button variant="outline-secondary" onClick={this.handleRender}>Render</Button>)

        return form
    }
    
    render() {
        if(!this.state.loaded){
            return null;
        } else {
            return (
                <div className="data">
                    <Container id="chart-container">
                    <Chart
                  options={this.state.options}
                  series={this.state.series}
                  width="100%"
                />
                    </Container>
                    <Container id="chart-options">
                        {this.showConfig()}
                    </Container>
                </div>
            )
        }
    }
}

export default Data;