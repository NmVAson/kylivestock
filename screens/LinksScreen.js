import React from 'react';
import { AsyncStorage}  from 'react-native';
import { WebBrowser } from 'expo';
import {
  Container,
  Content,
  List,
  ListItem,
  Text,
  Body,
  Title,
  Left,
  Right
} from 'native-base';
import RadioForm from 'react-native-simple-radio-button';
import PubSub from 'pubsub-js';

var DomParser = require('react-native-html-parser').DOMParser;

export default class LinksScreen extends React.Component {
  state = {
    data: [{}],
    selectedYard: 0
  }
  static navigationOptions = {
    title: 'KY Stockyards'
  };

  storeData(results) {
    let selectedButton = this.state.data.find(e => e.selected == true);
    selectedButton = selectedButton ? selectedButton.value : this.state.data[0].label;

    this.setState({
      selectedYard: selectedButton,
      data: results
    });
  }

  componentWillMount() {
    AsyncStorage.getItem("preferred-stockyard").then((value) => {
      this.setState({selectedYard: value});
    }).done();
  }

  componentDidMount() {
    fetch('https://cattlerange.com/cattle-auction-reports-results/kentucky-auctions/', {method: 'GET'})
      .then((response) => response.text())
      .then((html) => {
        const parser = new DomParser()
        const doc = parser.parseFromString(html, 'text/html')

        return Array
          .from(doc.getElementsByTagName('a'))
          .filter(element => element.getAttribute('rel') !== '')
          .map((el, i) => {
            return {
                key: i,
                label: el.textContent,
                value: el.getAttribute('href'),
                selected: i == 0
              }
          });
      })
      .then(this.storeData.bind(this))
      .catch((error) => {
        console.error(error)
      })
  }
  
  componentWillUnmount() {
    AsyncStorage.setItem("preferred-stockyard", value);
  }

  render() {
    return (
      <Container>
        <Content padder>
          <RadioForm
            radio_props={this.state.data}
            onPress={(value) => {
              this.setState({selectedYard: value})
              PubSub.publish('reportSelected', value)
              AsyncStorage.setItem("preferred-stockyard", value);
            }}
          />
        </Content>
      </Container>
    );
  }
}
