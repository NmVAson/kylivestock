import React from 'react';
import { AsyncStorage, Picker, TextInput, View, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { Container, Content, ListItem, Text, Separator, Title } from 'native-base';
import { Header } from 'react-native-elements';
import SaveButton from '../components/SaveButton';


export default class SettingsScreen extends React.Component {

  static navigationOptions = {
    title: 'Settings'
  }

  state = {
    data: [{value: '', label: ''}],
    selectedYard: '',
    startWeight: 0,
    endWeight: 0
  }

  toPickerItem(s, i) {
    return <Picker.Item key={i} value={s.value} label={s.label} />
  }

  fetchStockyards() {
    let fetchOptions = {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic NHgvTWxUS243QTdRemc5dEpHTmM0ZTBVSVRRTzM3MmU6'
      }
    }

    fetch('https://marsapi.ams.usda.gov/services/v1/marketTypes/Auction Livestock', fetchOptions)
      .then((response) => {
        let body = response._bodyText
        let jsonResponse = JSON.parse(body)
        
        return jsonResponse.results
      })
      .then((reports) => reports.filter((report) => report.offices.includes("Lexington")))
      .then((reports) => {
        return reports.map((el, i) => {
          return {
              label: el.report_title,
              value: el.slug_name
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

    AsyncStorage.getItem("weight-start").then((value) => {
      if(value) {
        this.state.startWeight = value;
      }
    }).done();

    AsyncStorage.getItem("weight-end").then((value) => {
      if(value) {
        this.state.endWeight = value;
      }
    }).done();

    this.fetchStockyards()
  }

  componentWillUnmount() {
    AsyncStorage.setItem("weight-start", this.state.startWeight);
    AsyncStorage.setItem("weight-end", this.state.endWeight);
    AsyncStorage.setItem("preferred-stockyard", this.state.selectedYard);
  }

  render() {
    let items = this.state.data.map(this.toPickerItem);

    return (
      <Container style={{flex: 1}}>
        <ScrollView>
          <Separator bordered>
            <Text>STATE</Text>
          </Separator>
          <ListItem>
            <Text>Kentucky</Text>
          </ListItem>
          <Separator bordered>
            <Text>WEIGHT FILTER</Text>
          </Separator>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <TextInput 
              style={{height: 40, borderColor: 'lightgray', borderWidth: 1, width: 60, padding: 5}}
              keyboardType='numeric'
              onChangeText={(text) => {
                this.setState({startWeight: text});
                PubSub.publish('filterSelected', [`${this.state.startWeight}-${this.state.endWeight}`]);
              }}
              value={this.state.startWeight}
              maxLength={4} 
            />
            <Text style={{padding: 5}}> to </Text>
            <TextInput 
              style={{height: 40, borderColor: 'lightgray', borderWidth: 1, width: 60, padding: 5}}
              keyboardType='numeric'
              onChangeText={(text) => {
                this.setState({endWeight: text});
                PubSub.publish('filterSelected', [`${this.state.startWeight}-${this.state.endWeight}`]);
              }}
              value={this.state.endWeight}
              maxLength={4} 
            />
          </View>
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
        </ScrollView>
      </Container>
    );
  }
}
