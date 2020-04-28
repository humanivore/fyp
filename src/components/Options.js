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
        this.handleSubmit = this.handleSubmit.bind(this);
        this.metadata = [
            {
                "name": "RP Total Enrolment 2019",
                "resource_id": "1525c43e-b3b4-4071-a3c2-fb3a298b399b",
                "total_rows": 3,
                "measures": [
                    {
                        "title": "Academic year",
                        "name": "academic_year",
                        "type": "datetime",
                        "coverage": {
                            "max": "2019",
                            "min": "2017"
                        },
                        "options": [
                            "2019",
                            "2018",
                            "2017"
                        ]
                    }
                ],
                "values": [
                    {
                        "title": "Total enrolment",
                        "unit": "EA",
                        "name": "total_enrolment"
                    }
                ]
            },
            {
                "name": "Enrolment - MOE Kindergartens",
                "resource_id": "4ad866a7-c43a-4645-87fd-fc961c9de78a",
                "total_rows": 7,
                "measures": [
                    {
                        "title": "Year",
                        "name": "year",
                        "type": "datetime",
                        "coverage": {
                            "max": "2020",
                            "min": "2014"
                        },
                        "options": [
                            "2014",
                            "2015",
                            "2016",
                            "2017",
                            "2018",
                            "2019",
                            "2020"
                        ]
                    }
                ],
                "values": [
                    {
                        "title": "Enrolment",
                        "unit": "No. of Students",
                        "name": "enrolment"
                    }
                ]
            }
        ];
        this.options = [];
        this.state = {
            options: [],
        };
    };

    handleSubmit(e) {
        this.props.navigation.navigate('SecondPage', {
            JSON_ListView_Clicked_Item: this.state.username,
          })
    }

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

    reactForm = () => {
        let form = []
        var trace = this.options;

        let main = []
        main.push(<Form.Label><h2>Select data range options</h2></Form.Label>)
        this.metadata.forEach(dataset =>
            {
                this.options.push({})
                let index = this.options.length-1;
                trace = this.options[index]
                trace['id'] = dataset.resource_id
                let measures = []
                measures.push(<Form.Label><h3>{dataset.name}</h3></Form.Label>)
                
                dataset.measures.forEach(measure =>
                    {
                        console.log("trace", trace);
                        let options = []
                        options.push(<Form.Label><h4>{measure.title}</h4></Form.Label>)

                        if("options" in measure){
                            trace[measure.name] = measure.options
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
        main.push(<Button variant="outline-secondary" onClick={() => this.nextPath('/about') }>Submit</Button>)
        form.push(<Form>{main}</Form>)
        return form
    }
    

    render(){
        return (
            <Container>
            <div>
                { this.reactForm() }
            </div>
            </Container>
        );
    }
}

export default withRouter(Options);