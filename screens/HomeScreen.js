import React from 'react';
import { AsyncStorage, ListView } from 'react-native';
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
      rawData: '',
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2
      }),
      title: '',
      subtitle: '',
      filters: []
  }

  static navigationOptions = {
    title: 'Weekly Livestock Summary'
  };

  parseTables(data, filters = this.state.filters) {
    let lines = data.split('\n');
    let content = {};

    let title = ''
    for(i in lines) {
      let line = lines[i].trim()
      if(line.includes('Wt Range')) {
        title = lines[i-1].trim()

        if (!content[title]) {
          content[title] = [];
        }
      } else {
        let lineShouldBeRendered = filters.length == 0 || new RegExp(filters.join("|")).test(line)
        let parsedLine = line.match(/\S+/g) || []
        if(parsedLine.length == 5 && !line.includes('Report') && lineShouldBeRendered && content[title]) {
          content[title].push(line);
        }
      }
    }

    return content;
  }

  componentDidMount() {
    PubSub.subscribe('reportSelected', (msg, href) => this.fetchReport(href))
    PubSub.subscribe('filterSelected', (msg, weightsToFilter) => {
      this.setState({filters: weightsToFilter})

      let content = this.parseTables(this.state.rawData, weightsToFilter)
      this.setState({
        dataSource: this.state.dataSource.cloneWithRowsAndSections(content)
      })
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
        let content = this.parseTables(rawReport)
        let reportAsLines = rawReport.split('\n');
        let title = reportAsLines[3]
        let subtitle = reportAsLines[4];

        this.setState({
          dataSource: this.state.dataSource.cloneWithRowsAndSections(content),
          title: title,
          subtitle: subtitle,
          rawData: rawReport
        })
      })
      .catch((error) => {
        console.error(error)
      })
  }

  renderRow(item) {
    return (<ListItem itemHeader>
          <Body>
            <Text style={{ fontWeight: "bold" }}>{item}</Text>
          </Body>
      </ListItem>)
  }

  renderSectionHeader(data, category) {
    return data.length > 0 
    ? (<ListItem style={{ marginLeft: 0 }}>
        <Body>
          <Text>{category}</Text>
        </Body>
      </ListItem>) 
    : null;
  }

  render() {
    return (
      <Container>
        <Header>
          <Body>
            <Title>{this.state.title}</Title>
            <Subtitle>{this.state.subtitle}</Subtitle>
          </Body>
        </Header>
        <ListView
          enableEmptySections
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          renderSectionHeader={this.renderSectionHeader}
        />
      </Container>
    );
  }
}
