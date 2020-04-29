import React, { Component } from 'react';
import Data from './Data';
import Button from 'react-bootstrap/Button';
import { Container } from '@material-ui/core';

class Bookmark extends Component {
    constructor() {
        super();
        this.state = {
            resourceId: []
        }
    };

    display() {
        let results = []
        this.props.resourceId.forEach(e => {
            let item = []
            item.push(<div key={e.id}>{e.name}</div>)
            item.push(<Button 
                variant="outline-secondary" 
                key={e.id+ "-remove"}
                value={e.name}
                id={e.id}
                onClick={this.props.handler}>Remove</Button>)
            results.push(<Container key={e.id + "-box"}>{item}</Container>)
        });
        return results
    }

    render(){
        return (
            <div>
                <Container>
                    {this.display()}
                </Container>
            </div>
        );
    }
}

export default Bookmark;