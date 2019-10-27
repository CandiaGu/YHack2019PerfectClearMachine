import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Main from './src/main';
import { createStackNavigator, createSwitchNavigator, createAppContainer, StatusBar } from 'react-navigation';

import SplashScreen from './SplashScreen';
import Settings from './Settings';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.gravity = props.navigation.state.params.gravity;
    this.sp = props.navigation.state.params.startingPieces;

    console.log("????" + this.sp);
    console.log("in app");

  }

  render() {
  return (
    <View style={styles.container} >
      <Main gravity={this.gravity} init={this.sp}/>
    </View>
  );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

const InitialNavigator = createSwitchNavigator({
  Splash: SplashScreen,
  App: App,
  Settings: Settings
});

export default createAppContainer(InitialNavigator);
