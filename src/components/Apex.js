import React, { Component } from 'react';
import Chart from "react-apexcharts";
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import './Styles/chart.css';


class Apex extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: this.props.options,
            series: this.props.series,
        };
    };

    componentDidUpdate(prevProps) {
        console.log("I reached", this.props.series);
        console.log("prev", prevProps.series);
        if (this.props.series !== prevProps.series) {
            console.log("props", this.props.series);
            this.setState(this.state)
        }
    }

    // componentDidMount() {
    //     this.setState({options: this.props.options})
    //     this.setState({series: this.props.series})
    // }
    
    render() {
        // try {
            return (
                <div className="chart">
                    <Container id="chart-container">
                    <Chart
                  options={this.state.options}
                  series={this.state.series}
                  width="100%"
                />
                    </Container>
                </div>
            )
        // } catch(err) {
        //     <Alert variant='primary'>
        //         Please click on the submit button again!
        //     </Alert>
        // } 
    }
}

export default Apex;