import React from 'react';
import { FlatList, CheckBox } from 'react-native';
import { WebBrowser, Font } from 'expo';
import {
  Container,
  Header,
  Content,
  List,
  ListItem,
  Text,
  Body,
  Title
} from 'native-base';
import PubSub from 'pubsub-js'

var DomParser = require('react-native-html-parser').DOMParser;
export default class HomeScreen extends React.Component {
  state = {
    data: []
  }
  static navigationOptions = {
    header: null
  };

  componentDidMount() {
    PubSub.subscribe('reportSelected', (msg, href) => this.fetchReport(href))
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

  render() {
    return (
      <Container>
        <Header>
          <Body>
            <Title>Weekly Livestock Summary</Title>
          </Body>
        </Header>
        <Content>
          <Text>{this.state.data}</Text>
        </Content>
      </Container>
    );
  }
}
