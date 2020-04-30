import React, { Component } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import './Styles/options.css';
import { withRouter } from 'react-router-dom';


class Options extends Component {
    constructor() {
        super();
        this.metadata = [];
        this.options = [];
        this.state = {
            promiseIsResolved: false,
            options: [],
        };
    };

    nextPath(path) {
        this.props.history.push({
            pathname: path,
            data: this.options // your data array of objects
        })
    }

    handleCheck(e) {
        const selection = e.target.value.split('||');
        const index = parseInt(selection[0]);
        const measure = selection[1];
        const option = selection[2];

        console.log("selection", selection);

        for(const [k, v] of Object.entries(this.options[index])){
            if(k == measure){
                if(v.includes(option)){
                    v = v.filter(e => e !== option)
                } else {
                    v.push(option)
                }
            }
        }

        console.log("options", this.options)
    }

    fetchData() {
        let ids = []
        console.log("props", this.props.metadata.resourceId);
        this.props.metadata.resourceId.forEach(item => {
            ids.push(item.id)
        })
        let idString = ids.join()
        fetch(`http://localhost:7082/api/resource?resource_id=${idString}`, { 
            method: 'get', 
            mode: 'cors'
        }).then(response =>
            {
                var data = response.json()
                console.log('data', data);
                return data
            }
        ).then(result =>
            {
                console.log(result);
                let info = result.info
                this.metadata = info
                console.log('metadata',this.metadata);
                this.setState({promiseIsResolved: true})
            }
        )
    }

    reactForm = () => {

        let form = []
        var trace = this.options;

        let main = []
        main.push(<Form.Label><h3>Select data range options</h3></Form.Label>)
        this.metadata.forEach(dataset =>
            {
                this.options.push({})
                let index = this.options.length-1;
                trace = this.options[index]
                trace['dataset_name'] = dataset.name
                trace['id'] = dataset.resource_id
                trace['total_rows'] = dataset.total_rows
                trace['values'] = dataset.values[0].name
                let measures = []
                measures.push(<Form.Label><h4>{dataset.name}</h4></Form.Label>)
                
                dataset.measures.forEach(measure =>
                    {
                        console.log("trace", trace);
                        let options = []
                        options.push(<Form.Label><h5>{measure.title}</h5></Form.Label>)

                        if("options" in measure){
                            trace[measure.name] = measure.options
                            if(measure.type == "datetime"){
                                trace['datetime'] = measure.name
                                trace['interval'] = measure.interval
                            }
                            measure.options.forEach(option =>
                                {
                                    var value = index + "||" + measure.name + "||" + option;
                                    options.push(<FormControlLabel
                                        value={value}
                                        checked // hello pls send help
                                        control={<Checkbox />}
                                        label={option}
                                        labelPlacement="end"
                                        onChange={this.handleCheck.bind(this)}
                                        />
                                    )
                                }
                            )
                        } else {

                        }

                        measures.push(<Form.Group controlId={measure.name}>{options}</Form.Group>)
                    }
                )

                main.push(<Form.Group controlId={dataset.name}>{measures}</Form.Group>)
            }
        )
        main.push(<Button variant="outline-secondary" onClick={() => this.nextPath('/chart') }>Submit</Button>)
        form.push(<Form>{main}</Form>)
        return form
    }
    
    componentDidMount(){
        this.fetchData()
    }

    render(){
        if(!this.state.promiseIsResolved){
            return null;
        } else {
            return (
                <Container>
                <div>
                    { this.reactForm() }
                </div>
                </Container>
            );
        }
    }
}

export default withRouter(Options);