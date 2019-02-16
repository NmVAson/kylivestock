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

var DomParser = require('react-native-html-parser').DOMParser;
export default class HomeScreen extends React.Component {
  state = {
    data: []
  }
  static navigationOptions = {
    header: null
  };

  componentDidMount = () => {
    fetch('https://cattlerange.com/cattle-auction-reports-results/kentucky-auctions/', {method: 'GET'})
      .then((response) => response.text())
      .then((html) => {
        const parser = new DomParser()
        const doc = parser.parseFromString(html, 'text/html')

        const kyLivestockLinks = Array
          .from(doc.getElementsByTagName('a'))
          .filter(element => element.getAttribute('rel') !== '')
          .map((el,i) => {
            return (<ListItem key={i}>
              <CheckBox
                title='Hi'
                checked={this.state.checked}
                iconType='material'
              />
              <Body>
                <Text>{el.textContent}</Text>
              </Body>
            </ListItem>)
          });
        this.setState({data: kyLivestockLinks});
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
          <Text>Hello!</Text>
        </Content>
      </Container>
    );
  }
}
