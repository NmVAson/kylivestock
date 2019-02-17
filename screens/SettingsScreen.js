import React from 'react';
import { AsyncStorage } from 'react-native';
import { Container, Header, Content, List, ListItem, Text, Separator } from 'native-base';


export default class SettingsScreen extends React.Component {
  state = {
    settings: []
  }
  static navigationOptions = {
    title: 'Settings',
  };

  componentDidMount() {
    AsyncStorage.getItem("preferred-stockyard").then((value) => {
      this.setState({settings: {"Preferred Stockyard": value}});
    }).done();
  }

  render() {
    return (
      <Container>
        <Content>
          <Separator bordered>
            <Text>STATE</Text>
          </Separator>
          <ListItem>
            <Text>Kentucky</Text>
          </ListItem>
          <Separator bordered>
            <Text>SAVED STOCKYARD</Text>
          </Separator>
          <ListItem>
            <Text>{this.state.settings["Preferred Stockyard"]}</Text>
          </ListItem>
        </Content>
      </Container>
    );
  }
}
