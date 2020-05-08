import React, { Component } from 'react'
import Bookmark from './Bookmark';
import FilterForm from './FilterForm';
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import './styles/browser.css';

class Datasets extends Component {
    constructor(props) {
        super(props)
        this.changeState = this.changeState.bind(this);
        this.handler = this.handler.bind(this)
        this.state = {
            resource: []
        }
    }

    display() {
        let results = []
        this.props.data.forEach(e => {
            let item = []
            item.push(<h4 key={e.id + "-name"}>{e.name}</h4>)
            item.push(<div key={e.id + "-desc"}>{e.description}</div>)
            item.push(<Button 
                variant="outline-secondary" 
                key={e.id}
                value={e.name}
                id={e.id}
                onClick={this.changeState}>Add</Button>)
            results.push(<Container key={e.id + "-box"}>{item}</Container>)
        });
        return results
    }

    changeState(e) {
        let item = {
            name: e.target.value,
            id: e.target.id
        }
        console.log(item)
        let newArray = []
        console.log(this.state.resource);
        if(this.state.resource.indexOf(item) > -1){
            newArray = this.state.resource.filter(e => e !== item)
        } else {
            newArray = [...this.state.resource, item];
        }
        this.setState({resource: newArray})
        console.log("resource", this.state.resource);
    }

    handler(e) {
        let id = e.target.id
        let newArray = []
        this.state.resource.forEach(item => {
            for (let [key, value] of Object.entries(item)) {
                if(key == "id"){
                    if(value == id){
                        newArray = this.state.resource.filter(e => e !== item)
                        this.setState({resource: newArray})
                        console.log("resource", this.state.resource);
                    }
                }
            }
        })
    }
    
    
    render() {
        return (
        <div>
            <Container id="main">
                <Row>
                    <Col md="auto">
                        <Container id="results">
                            <FilterForm onChange={this.props.onChange}/>
                            {this.display()}
                        </Container>
                    </Col>
                    <Col md="auto">
                        <Bookmark id="bookmark" resource={this.state.resource} handler={this.handler} />   
                    </Col>
                </Row>
            </Container>
        </div>
        )
    }
}

export default Datasets