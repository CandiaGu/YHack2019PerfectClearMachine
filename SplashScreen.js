import React from 'react';
import { View, Text, Image } from 'react-native';

class SplashScreen extends React.Component {
  performTimeConsumingTask = async() => {
    return new Promise((resolve) =>
      //calculate stuff here probs?
      setTimeout(
        () => { resolve('result') },
        1000
      )
    )
  }

  async componentDidMount() {
    // Preload data from an external API
    // Preload data using AsyncStorage
    const data = await this.performTimeConsumingTask();

    if (data !== null) {
      this.props.navigation.navigate('App');
    }
  }

  render() {
    return (
      <View style={styles.viewStyles}>
              <Image source={require('./assets/loading.png')} style={{width: 100, height: 100, resizeMode: 'contain',}}/>
      </View>
    );
  }
}

const styles = {
  viewStyles: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#364785'
  }
}

export default SplashScreen;