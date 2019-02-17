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
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import PubSub from 'pubsub-js'

var DomParser = require('react-native-html-parser').DOMParser;
export default class HomeScreen extends React.Component {
  state = {
    data: '',
    filters: []
  }
  static navigationOptions = {
    title: 'Weekly Livestock Summary'
  };

  componentDidMount() {
    PubSub.subscribe('reportSelected', (msg, href) => this.fetchReport(href))
    PubSub.subscribe('filterSelected', (msg, weightsToFilter) => this.setState({filters: weightsToFilter}))

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
      let parsedLine = line.trim().match(/\S+/g) || []
      if(line.includes('Wt Range')) {
        let tableTitle = tableContent[i-1].trim()
        content.push(<ListItem itemDivider><Text>{tableTitle}</Text></ListItem>)

        let columns = parsedLine.map((col) => (<Text>{col}</Text>))
        content.push(<ListItem itemHeader style={{justifyContent: 'space-evenly'}}>{columns}</ListItem>)
      }

      let lineShouldBeRendered = this.state.filters.length == 0 || new RegExp(this.state.filters.join("|")).test(line)
      if(parsedLine.length == 5 && !line.includes('Report') && lineShouldBeRendered) {
        let columns = parsedLine.map((col) => (<Text>{col}</Text>))
        content.push(<ListItem style={{justifyContent: 'space-evenly'}}>{columns}</ListItem>);
      }
    }
    return content
  }

  splitByTable() {
    let tables = this.state.data
      .replace(/\n\r/g, "\n")
      .replace(/\r/g, "\n")
      .split(/\n{2,}/g)
      .map((line) => line.trim())

    console.log(tables)
  }

  render() {
    let reportAsLines = this.state.data.split('\n');
    let tables = this.splitByTable()
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
        <Content>
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
