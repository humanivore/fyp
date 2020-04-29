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

    componentDidUpdate(prevProps) {
        if (this.props.resourceId !== prevProps.resourceId) {
            // code
        }
    }

    render(){
        return (
            <div>
                <Container>
                    {this.state.resourceId}
                </Container>
            </div>
        );
    }
}

export default Bookmark;