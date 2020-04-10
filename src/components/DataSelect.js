import React, { Component } from 'react';
import Data from './Data';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Button from '@material-ui/core/Button';

class DataSelect extends Component {
    constructor() {
        super();
        this.handleSubmit = this.handleSubmit.bind(this);
        this.resource = [];
        this.state = {
            resourceId: [],
        };
    };

    handleSubmit(e) {
        this.setState({resourceId: this.resource});
        console.log('resource', this.resource);
        console.log('resourceId', this.state.resourceId);

        e.preventDefault();
    }

    handleCheck(e) {
        const newSelection = e.target.value;
        let newSelectionArray;

        if(this.resource.indexOf(newSelection) > -1) {
        newSelectionArray = this.resource.filter(e => e !== newSelection)
        } else {
        newSelectionArray = [...this.resource, newSelection];
        }

        this.resource = newSelectionArray;
    }

    render(){
        return (
            <div>
            <Data resource={this.state.resourceId}/>
            <form onSubmit={this.handleSubmit}>
                <FormControl component="fieldset">
                <FormLabel component="legend">Datasets</FormLabel>
                <FormGroup name="resource" aria-label="position">
                    <FormControlLabel
                    value="1525c43e-b3b4-4071-a3c2-fb3a298b399b"
                    control={<Checkbox color="primary" />}
                    label="Republic Polytechnic Total Enrolment 2019"
                    labelPlacement="end"
                    onChange={this.handleCheck.bind(this)}
                    />
                    <FormControlLabel
                    value="4ad866a7-c43a-4645-87fd-fc961c9de78a"
                    control={<Checkbox color="primary" />}
                    label="Enrolment - MOE Kindergartens"
                    labelPlacement="end"
                    onChange={this.handleCheck.bind(this)}
                    />
                </FormGroup>
                <Button type="submit" variant="contained">Submit</Button>
                </FormControl>
            </form>
            </div>
        );
    }
}

export default DataSelect;