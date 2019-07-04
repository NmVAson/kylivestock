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

  fetchReport(reportId) {    
    let fetchOptions = {
      method: 'GET',
      headers: {
          'Authorization': 'Basic NHgvTWxUS243QTdRemc5dEpHTmM0ZTBVSVRRTzM3MmU6'
      }
    }
    let href = `https://marsapi.ams.usda.gov/services/v1.1/reports/${reportId}?sort=-published_date`
    let today = new Date()
    let aWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)

    fetch(href, fetchOptions)
      .then((response) => {
        let body = response._bodyText
        let jsonResponse = JSON.parse(body)
        
        return jsonResponse.results
      })
      .then(reportLines => {
        let maxDate = reportLines[0].published_date
        return reportLines.filter(reportLine => reportLine.published_date == maxDate)
      })
      .then((linesFromLatestReport) => {
        this.setState({report: linesFromLatestReport});
      })
      .catch((error) => console.error(error))
  }


  render() {
    return (
      <Container>
        {this.state.report.map((category) => {
          return (
            <Text>{category.class}</Text>
          );
        })}
        <SettingsButton navigation={this.props.navigation}/>
      </Container>
    );
  }
}
