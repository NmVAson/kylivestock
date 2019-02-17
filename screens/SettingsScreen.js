import React from 'react';
import { AsyncStorage, CheckBox } from 'react-native';
import { Container, Header, Content, List, ListItem, Text, Separator, Body } from 'native-base';


export default class SettingsScreen extends React.Component {
  state = {
    settings: [],
    filters: [
      {
        isChecked: false, 
        weightRange: '350-400'
      },{
        isChecked: false, 
        weightRange: '400-450'
      },{
        isChecked: false, 
        weightRange: '450-500'
      },{
        isChecked: false, 
        weightRange: '500-550'
      },{
        isChecked: false, 
        weightRange: '550-600'
      },{
        isChecked: false, 
        weightRange: '600-650'
      },{
        isChecked: false, 
        weightRange: '650-700'
      },{
        isChecked: false, 
        weightRange: '750-800'
      },{
        isChecked: false, 
        weightRange: '800-850'
      },{
        isChecked: false, 
        weightRange: '850-900'
      },{
        isChecked: false, 
        weightRange: '900-950'
      },{
        isChecked: false, 
        weightRange: '950-1000'
      }]
  }
  static navigationOptions = {
    title: 'Settings',
  };

  onPress(weight) {
    let newFilters = this.state.filters
    newFilters.forEach((filter, i) => {
      if(filter.weightRange == weight) {
        newFilters[i].isChecked = !newFilters[i].isChecked
      }
    })

    this.setState({filters: newFilters})

    let filteredWeights = newFilters.filter((f) => f.isChecked).map((f) => f.weightRange)
    PubSub.publish('filterSelected', filteredWeights)
  }

  getFilterCheckBoxes() {
    let filters = this.state.settings["weight-filters"] || this.state.filters

    return filters.map((filter) => {
      return (
        <ListItem onPress={() => this.onPress(filter.weightRange)}>
          <CheckBox 
            value={filter.isChecked}
            onChange={() => this.onPress(filter.weightRange)}/>
          <Body>
            <Text>{filter.weightRange}</Text>
          </Body>
        </ListItem>
      )
    })
  }

  componentDidMount() {
    let settings = this.state.settings

    AsyncStorage.getItem("preferred-stockyard").then((value) => {
      settings["preferred-stockyard"] = value
      this.setState({settings: settings});
    }).done();

    AsyncStorage.getItem("weight-filters").then((value) => {
      settings["weight-filters"] = value
      this.setState({settings: settings});
    }).done();
  }

  componentWillUnmount() {
    AsyncStorage.setItem("weight-filters", this.state.filters);
  }

  render() {
    let filters = this.getFilterCheckBoxes()

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
            <Text>{this.state.settings["preferred-stockyard"]}</Text>
          </ListItem>
          <Separator bordered>
            <Text>WEIGHT FILTERS</Text>
          </Separator>
          {filters}
        </Content>
      </Container>
    );
  }
}
