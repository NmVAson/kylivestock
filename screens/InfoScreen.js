import React from 'react';
import { AsyncStorage, Linking, Text, Button } from 'react-native';
import { Container } from 'native-base';
import PubSub from 'pubsub-js'

var DomParser = require('react-native-html-parser').DOMParser;
export default class InfoScreen extends React.Component {
  state = {
    reportLocation: ''
  }

  static navigationOptions = {
    title: 'PDF Report'
  }

  setDownloadLink(slug) {
    var link = `https://www.ams.usda.gov/mnreports/${slug}.pdf`

    this.setState({reportLocation: link})
  }

  componentDidMount() {
    PubSub.subscribe('reportSelected', (msg, slug) => this.setDownloadLink(slug))

    AsyncStorage
      .getItem("preferred-stockyard")
      .then((value) => {
        if(value) {
          this.setDownloadLink(value)
        }
      })
      .done();
  }

  openPDF() {
    Linking.canOpenURL(this.state.reportLocation).then(supported => {
      if (supported) {
        Linking.openURL(this.state.reportLocation);
      } else {
        console.log('Don\'t know how to open URI: ' + this.state.reportLocation);
      }
    })
  }

  render(){
    if(this.state.reportLocation){
      return (
        <Container>
            <Button 
              onPress={this.openPDF.bind(this)} 
              title='View PDF'
            />
        </Container>
      );
    } else {
      return (<Text>Head to the settings tab to select a stockyard.</Text>)
    }
  }
}
