import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import { Container } from '@material-ui/core';
import { withRouter } from 'react-router-dom';

class Bookmark extends Component {
    constructor() {
        super();
    };

    display() {
        let results = []
        results.push(<h4 id="title-bookmark">Bookmarked</h4>)
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

    nextPath(path) {
        this.props.history.push({
            pathname: path,
            data: this.props // your data array of objects
        })
    }

    render(){
        return (
            <div>
                <Container id="bookmark">
                    {this.display()}
                    <Button 
                        variant="secondary" 
                        key="bookmark-submit" 
                        onClick={() => this.nextPath('/select')}>
                            Submit
                    </Button>
                </Container>
            </div>
        );
    }
}

export default withRouter(Bookmark);