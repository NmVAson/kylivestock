import React from 'react';
import { AsyncStorage, ListView, ScrollView } from 'react-native';
import {
  Container,
  Content,
  ListItem,
  Text,
  Title,
  Subtitle,
  Button
} from 'native-base';
import { Col, Row, Grid } from "react-native-easy-grid";
import PubSub from 'pubsub-js';

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
        <ScrollView>
        {this.state.report.map((category) => {
          return (
            <Grid>
              <Row><Col><Text>{category.class} {category.frame}</Text></Col></Row>
              <Row>
                <Col><Text>{category.market_location_name}</Text></Col>
                <Col><Text>{category.avg_price}</Text></Col>
                <Col><Text>{category.avg_weight}</Text></Col>
              </Row> 
            </Grid>
          );
        })}
        </ScrollView>
      </Container>
    );
  }
}
