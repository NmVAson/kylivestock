import React from 'react';
import { AsyncStorage, ListView } from 'react-native';
import {
  Container,
  Content,
  ListItem,
  Text,
  Title,
  Subtitle,
  Button
} from 'native-base';
import { Table, Row, Col } from 'react-native-table-component';
import PubSub from 'pubsub-js';
import SettingsButton from '../components/SettingsButton';

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
    title: 'Report'
  }

  parseTables(data, filters = this.state.filters) {
    let lines = data.split('\n');
    let content = {};

    let title = ''
    for(i in lines) {
      let line = lines[i].trim()
      if(line.includes('Wt Range')) {
        title = lines[i-1].trim() + '\n' + line

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
    let columns = item.match(/\S+/g).map((col) => (<Text style={{ marginLeft: 0 }}>{col}</Text>))

    return (<ListItem style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>{columns}</ListItem>)
  }

  renderSectionHeader(data, category) {
    let parts = category.split('\n')
    let title = parts[0]
    let tableHeaders = parts[1].match(/\S+/g).map((col) => (<Text style={{ marginLeft: 0, fontSize: 15}}>{col}</Text>))

    return data.length > 0 
    ? (<Content>
       <ListItem itemHeader style={{ alignContent: "center" }}>
          <Text style={{ fontWeight: "bold" }}>{title}</Text>
        </ListItem>
        <ListItem itemHeader style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>{tableHeaders}</ListItem>
      </Content>) 
    : null;
  }

  render() {
    return (
      <Container>
        <ListView
          enableEmptySections
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          renderSectionHeader={this.renderSectionHeader}
        />
        <SettingsButton navigation={this.props.navigation}/>
      </Container>
    );
  }
}
