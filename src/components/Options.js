import React, { Component } from 'react';
import Data from './Data';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import './Styles/options.css';

class Options extends Component {
    constructor() {
        super();
        this.handleSubmit = this.handleSubmit.bind(this);
        this.metadata = [
            {
                "name": "Singapore Residents by Ethnic Group and Sex, End June, Annual",
                "resource_id": "f9dbfc75-a2dc-42af-9f50-425e4107ae84",
                "total_rows": 930,
                "measures": [
                    {
                        "title": "Year",
                        "name": "year",
                        "type": "datetime",
                        "coverage": {
                            "max": "2018",
                            "min": "1957"
                        },
                        "options": [
                            "1957",
                            "1958",
                            "1959",
                            "1960",
                            "1961",
                            "1962",
                            "1963",
                            "1964",
                            "1965",
                            "1966",
                            "1967",
                            "1968",
                            "1969",
                            "1970",
                            "1971",
                            "1972",
                            "1973",
                            "1974",
                            "1975",
                            "1976",
                            "1977",
                            "1978",
                            "1979",
                            "1980",
                            "1981",
                            "1982",
                            "1983",
                            "1984",
                            "1985",
                            "1986",
                            "1987",
                            "1988",
                            "1989",
                            "1990",
                            "1991",
                            "1992",
                            "1993",
                            "1994",
                            "1995",
                            "1996",
                            "1997",
                            "1998",
                            "1999",
                            "2000",
                            "2001",
                            "2002",
                            "2006",
                            "2003",
                            "2004",
                            "2005",
                            "2007",
                            "2008",
                            "2009",
                            "2010",
                            "2011",
                            "2012",
                            "2013",
                            "2014",
                            "2015",
                            "2016",
                            "2017",
                            "2018"
                        ]
                    },
                    {
                        "title": "Ethnic Group/Gender",
                        "name": "level_1",
                        "type": "text",
                        "options": [
                            "Total Residents",
                            "Total Male Residents",
                            "Total Female Residents",
                            "Total Malays",
                            "Total Male Malays",
                            "Total Female Malays",
                            "Total Chinese",
                            "Total Male Chinese",
                            "Total Female Chinese",
                            "Total Indians",
                            "Total Male Indians",
                            "Total Female Indians",
                            "Other Ethnic Groups (Total)",
                            "Other Ethnic Groups (Males)",
                            "Other Ethnic Groups (Females)"
                        ]
                    }
                ],
                "values": [
                    {
                        "title": "Value",
                        "unit": "Number",
                        "name": "value"
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
        this.setState({options: this.options});
        console.log('resource', this.resource);
        console.log('resourceId', this.state.resourceId);

        e.preventDefault();
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
        main.push(<Form.Label><h1>Select data range options</h1></Form.Label>)
        this.metadata.forEach(dataset =>
            {
                this.options.push({})
                let index = this.options.length-1;
                trace = this.options[index]
                trace['id'] = dataset.resource_id
                let measures = []
                measures.push(<Form.Label><h2>{dataset.name}</h2></Form.Label>)
                
                dataset.measures.forEach(measure =>
                    {
                        console.log("trace", trace);
                        let options = []
                        options.push(<Form.Label><h3>{measure.title}</h3></Form.Label>)

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
        main.push()
        form.push(<Form>{main}</Form>)
        return form
    }
    

    render(){
        return (
            
            <Container>
            <Data resource={this.state.resourceId}/>
            <div>
                { this.reactForm() }
            </div>
            </Container>
        );
    }
}

export default Options;