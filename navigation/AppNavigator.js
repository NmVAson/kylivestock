import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import SettingsScreen from '../screens/SettingsScreen';
import MainTabNavigator from './MainTabNavigator';

export default createAppContainer(createSwitchNavigator({
  Main: MainTabNavigator,
  Settings: { screen: SettingsScreen }
}));