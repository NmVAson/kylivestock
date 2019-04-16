import React from 'react';
import { AsyncStorage } from 'react-native';
import { Container, Content, Text } from 'native-base';
import PubSub from 'pubsub-js'

var DomParser = require('react-native-html-parser').DOMParser;
export default class InfoScreen extends React.Component {
  state = {
    data: '',
    href: ''
  }

  static navigationOptions = {
    title: 'Source'
  }

  componentDidMount() {
    PubSub.subscribe('reportSelected', (msg, href) => this.fetchReport(href))

    AsyncStorage
      .getItem("preferred-stockyard")
      .then((value) => {
        if(value) {
          this.setState({href: value})
          this.fetchReport(value)
        } else {
        }
      })
      .done();
  }

  fetchReport(href) {
    fetch(href, {method: 'GET'})
      .then((response) => response.text())
      .then((rawReport) => {
        this.setState({data: rawReport});
      })
      .catch((error) => {
        console.error(error)
      })
  }

  render(){
    return (
      <Container>
        <Content>
          <Text>{this.state.data}</Text>
        </Content>
      </Container>
    );
  }
}
