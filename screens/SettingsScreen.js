import React from 'react';
import { AsyncStorage, CheckBox, Picker } from 'react-native';
import { Container, Header, Content, List, ListItem, Text, Separator, Body } from 'native-base';
import { DOMParser } from 'react-native-html-parser'


export default class SettingsScreen extends React.Component {
  state = {
    data: [{value: '', label: ''}],
    selectedYard: '',
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

  applyFilter(newFilters) {
    this.setState({filters: newFilters})
    AsyncStorage.setItem("weight-filters", newFilters);

    let filteredWeights = newFilters.filter((f) => f.isChecked).map((f) => f.weightRange)
    PubSub.publish('filterSelected', filteredWeights)
  }

  onPress(weight) {
    let newFilters = this.state.filters
    newFilters.forEach((filter, i) => {
      if(filter.weightRange == weight) {
        newFilters[i].isChecked = !newFilters[i].isChecked
      }
    })

    this.applyFilter(newFilters)
  }

  toCheckBoxItem(filter) {
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
  }

  toPickerItem(s, i) {
    return <Picker.Item key={i} value={s.value} label={s.label} />
  }

  fetchStockyards() {
    fetch('https://cattlerange.com/cattle-auction-reports-results/kentucky-auctions/', {method: 'GET'})
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')

        return Array
          .from(doc.getElementsByTagName('a'))
          .filter(element => element.getAttribute('rel') !== '')
          .map((el, i) => {
            return {
                label: el.textContent,
                value: el.getAttribute('href')
              }
          });
      })
      .then((results) => this.setState({data: results}))
      .catch((error) => {
        console.error(error)
      })
  }

  componentDidMount() {
    AsyncStorage.getItem("preferred-stockyard").then((value) => {
      this.setState({selectedYard: value});
    }).done();

    AsyncStorage.getItem("weight-filters").then((value) => {
      if(value) {
        this.applyFilter(value)
      }
    }).done();

    this.fetchStockyards()
  }

  componentWillUnmount() {
    AsyncStorage.setItem("weight-filters", this.state.filters);
    AsyncStorage.setItem("preferred-stockyard", this.state.selectedYard);
  }

  render() {
    let filters = this.state.filters.map(this.toCheckBoxItem.bind(this));
    let items = this.state.data.map(this.toPickerItem);

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
            <Text>STOCKYARD</Text>
          </Separator>
          <Picker
            mode="dropdown"
            selectedValue={this.state.selectedYard}
            onValueChange={(itemValue) => {
              this.setState({selectedYard: itemValue})
              PubSub.publish('reportSelected', itemValue)
              AsyncStorage.setItem("preferred-stockyard", itemValue);
            }}
            >
            {items}
          </Picker>
          <Separator bordered>
            <Text>WEIGHT FILTERS</Text>
          </Separator>
          {filters}
        </Content>
      </Container>
    );
  }
}
