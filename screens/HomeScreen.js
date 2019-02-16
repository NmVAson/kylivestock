import React from 'react';
import { FlatList, CheckBox } from 'react-native';
import { WebBrowser } from 'expo';
import {
  Container,
  Header,
  Content,
  List,
  ListItem,
  Text,
  Body
} from 'native-base'

var DomParser = require('react-native-html-parser').DOMParser;
export default class HomeScreen extends React.Component {
  state = {
    data: [],
    selectedItems: {}
  }
  static navigationOptions = {
    header: null,
  };

  onItemPressed(item) {
    var oldSelectedItems = this.state.selectedItems;
    var itemState = oldSelectedItems[item.key];

    if(!itemState) {
      oldSelectedItems[item.key] = true;
    } else {
      var newState = !itemState;
      oldSelectedItems[item.key] = newState;
    }

    this.setState({selectedItems: oldSelectedItems});
  }

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
                checked={this.state.checked}
                onPress={() => this.setState({
                  checked: !this.state.checked
                })}
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
        <Header/>
        <Content>
          {this.state.data}
        </Content>
      </Container>
    );
  }
}
