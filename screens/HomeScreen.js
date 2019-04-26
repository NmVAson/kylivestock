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
import StockyardReportParser from '../report/Parser';

var DomParser = require('react-native-html-parser').DOMParser;
export default class HomeScreen extends React.Component {
  state = {
      rawData: '',
      report: [],
      minWeight: Number.NaN,
      maxWeight: Number.NaN
  }

  static navigationOptions = {
    title: 'Report'
  }

  componentDidMount() {
    AsyncStorage.getItem("weight-start")
      .then((value) => {
        this.setState({minWeight: value})
      }).done();

    AsyncStorage.getItem("weight-end")
      .then((value) => {
        this.setState({maxWeight: value})
      }).done();

    AsyncStorage
      .getItem("preferred-stockyard")
      .then((value) => {
        if(value) this.fetchReport(value);
      })
      .done();
  }

  fetchReport(href) {
    fetch(href, {method: 'GET'})
      .then((response) => response.text())
      .then((rawReport) => {
        var reportLines = rawReport.split('\n');
        var firstCategoryPosition = reportLines.findIndex((line) => line.includes('Wt Range')) - 1;
        var reportWithoutIntro = reportLines.slice(firstCategoryPosition).join('\n');
        console.log(`${reportWithoutIntro}`);
        let report = new StockyardReportParser().Report.parse(reportWithoutIntro);
        console.log(report);

        let filteredReport = report.map(category => {
          category.filter(this.state.minWeight, this.state.maxWeight);
        });

        console.log(filteredReport);

        this.setState({report: filteredReport});
      })
      .catch((error) => console.error(error))
  }


  render() {
    return (
      <Container>
        {this.state.report.map((category) => {
          return (
            <Text>{category.Label}</Text>
          );
        })}
        <SettingsButton navigation={this.props.navigation}/>
      </Container>
    );
  }
}
