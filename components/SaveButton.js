

import React, {Component} from 'react';
import { StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';

export default class SaveButton extends React.Component {
    render() {
        const {navigate} = this.props.navigation;

        return (<Icon
            reverse
            raised
            name='save'
            color='#517fa4'
            onPress={() => navigate('Main')}
            containerStyle={styles.TouchableOpacityStyle}
            iconStyle={styles.FloatingButtonStyle}
        />);
    }
}

const styles = StyleSheet.create({
    TouchableOpacityStyle: {
      position: 'absolute',
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      right: 30,
      bottom: 75,
    },
   
    FloatingButtonStyle: {
      resizeMode: 'contain'
    }
  });
  