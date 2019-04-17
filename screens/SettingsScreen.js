import React from 'react';
import { AsyncStorage, Picker, TextInput, View, ScrollView, Dimensions } from 'react-native';
import { Container, Content, ListItem, Text, Separator, Title } from 'native-base';
import { Header } from 'react-native-elements';
import { DOMParser } from 'react-native-html-parser';
import SaveButton from '../components/SaveButton';


export default class SettingsScreen extends React.Component {
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
    let width = Dimensions.get('window').width;

    console.log(width)

    return (
      <Container style={{flex: 1}}>
        <Header 
          leftContainerStyle={style.headerTitleContainer}
          leftComponent={<Title style={style.headerTitle}>Settings</Title>}
          containerStyle={styles.header}/>
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
        <SaveButton navigation={this.props.navigation}/>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff'
  },

  headerTitleContainer: {
    justifyContent:"flex-start"
  },
 
  headerTitle: {
    color: "black", 
    fontWeight: "bold", 
    paddingLeft: 5, 
    width: width
  }
});