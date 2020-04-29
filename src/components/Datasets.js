import React, { Component } from 'react'
import Bookmark from './Bookmark';
import FilterForm from './FilterForm';
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

class Datasets extends Component {
    constructor(props) {
        super(props)
        this.state = {
        filter: ""
        }
    }

    display() {
        let results = []
        this.props.data.forEach(e => {
            let item = []
            item.push(<h4 key={e.id + "-name"}>{e.name}</h4>)
            item.push(<div key={e.id + "-desc"}>{e.description}</div>)
            item.push(<Button variant="outline-secondary" key={e.id}>Add</Button>)
            results.push(<Container key={e.id + "-box"}>{item}</Container>)
        });
        return results
    }
    
    
    render() {
        return (
        <div id="browser">
            <Container>
                <FilterForm onChange={this.props.onChange}/>
                {this.display()}
            </Container>
            <Bookmark resourceId={this.state.resourceId} />
        </div>
        )
    }
}

export default Datasets