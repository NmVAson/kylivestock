import React from 'react';
import { AsyncStorage } from 'react-native';
import { WebBrowser, Font } from 'expo';
import {
  Container,
  Header,
  Content,
  List,
  ListItem,
  Text,
  Body,
  Title,
  Subtitle,
  Separator,
  Footer,
  Left, Right
} from 'native-base';
import PubSub from 'pubsub-js'

var DomParser = require('react-native-html-parser').DOMParser;
export default class HomeScreen extends React.Component {
  state = {
    data: ''
  }
  static navigationOptions = {
    title: 'Weekly Livestock Summary'
  };

  componentDidMount() {
    PubSub.subscribe('reportSelected', (msg, href) => this.fetchReport(href))

    AsyncStorage
      .getItem("preferred-stockyard")
      .then((value) => {
        if(value) {
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

  getTableHeaders(lines) {
    let content = [];
    let firstTableRow = lines.findIndex((value) => value.includes('Wt Range')) - 1

    let tableContent = lines.slice(firstTableRow)
    for(i in tableContent) {
      let line = tableContent[i]
      if(line.includes('Wt Range')) {
        let tableTitle = tableContent[i-1].trim()
        content.push(
            <Separator>
              <Text>{tableTitle}</Text>
            </Separator>)
      }

      let parsedLine = line.trim().match(/\S+/g) || []
      if(parsedLine.length == 5 && !line.includes('Report')) {
        content.push(
          <ListItem>
            <Text>{line}</Text>
          </ListItem>)
      }
    }
    return content
  }

  render() {
    let reportAsLines = this.state.data.split('\n');
    let title = reportAsLines[3]
    let subtitle = reportAsLines[4];
    let content = this.getTableHeaders(reportAsLines)

    return (
      <Container>
        <Header>
          <Body>
            <Title>{title}</Title>
          </Body>
        </Header>
        <Content padder>
          {content}
        </Content>
        <Footer>
            <Body>
              <Left/>
              <Subtitle>{subtitle}</Subtitle>
              <Right/>
            </Body>
        </Footer>
      </Container>
    );
  }
}
