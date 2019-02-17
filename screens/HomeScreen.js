import React from 'react';
import { AsyncStorage, FlatList, ScrollView } from 'react-native';
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
  Left, Right,
  Accordion
} from 'native-base';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import PubSub from 'pubsub-js'

var DomParser = require('react-native-html-parser').DOMParser;
export default class HomeScreen extends React.Component {
  state = {
    data: '',
    filters: [],
    tables: [],
    stickyHeaderIndices: []
  }
  static navigationOptions = {
    title: 'Weekly Livestock Summary'
  };

  parseTables(text) {
    let lines = text.split('\n');
    let content = [];

    for(i in lines) {
      let line = lines[i]
      if(line.includes('Wt Range')) {
        let tableTitle = lines[i-1].trim()

        content.push({name: line, header: true, title: tableTitle})
      }

      let lineShouldBeRendered = this.state.filters.length == 0 || new RegExp(this.state.filters.join("|")).test(line)
      let parsedLine = line.trim().match(/\S+/g) || []
      if(parsedLine.length == 5 && !line.includes('Report') && lineShouldBeRendered) {
        content.push({name: line, header: false})
      }
    }
    this.setState({tables: content})

    this.calculateIndices()
  }

  calculateIndices() {
    var arr = [];
    this.state.tables.map(obj => {
      if (obj.header) {
        arr.push(this.state.tables.indexOf(obj));
      }
    });
    arr.push(0);
    this.setState({stickyHeaderIndices: arr});
  }

  componentDidMount() {
    PubSub.subscribe('reportSelected', (msg, href) => this.fetchReport(href))
    PubSub.subscribe('filterSelected', (msg, weightsToFilter) => {
      this.setState({filters: weightsToFilter})
      this.parseTables(this.state.data)
    })

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
        this.parseTables(rawReport)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  renderItem = ({ item }) => {
    if (item.header) {
      return (
        <ListItem itemDivider>
            <Body>
              <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
              <Text>{item.name}</Text>
            </Body>
        </ListItem>
      );
    } else if (!item.header) {
      return (
        <ListItem style={{ marginLeft: 0 }}>
          <Body>
            <Text>{item.name}</Text>
          </Body>
        </ListItem>
      );
    }
  };

  render() {
    let reportAsLines = this.state.data.split('\n');
    let title = reportAsLines[3]
    let subtitle = reportAsLines[4];

    return (
      <Container>
        <Header>
          <Body>
            <Title>{title}</Title>
            <Subtitle>{subtitle}</Subtitle>
          </Body>
        </Header>
        <FlatList
          data={this.state.tables}
          renderItem={this.renderItem}
          keyExtractor={item => item.name}
          stickyHeaderIndices={this.state.stickyHeaderIndices}
        />
      </Container>
    );
  }
}
