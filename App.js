import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Main from './src/main';
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation';

import SplashScreen from './SplashScreen';

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
    <View style={styles.container}>
      <Main/>
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
  App: App
});

export default createAppContainer(InitialNavigator);
