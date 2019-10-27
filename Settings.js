import React from 'react';
import { View, Text, Image, Switch,Button } from 'react-native';

class Settings extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      gravity: false
    }

  }

  render() {
    return (
      <View style={styles.viewStyles}>
        <Text>Settings</Text>
        <Switch onValueChange={(value) => this.setState({gravity: value})}
          value={this.state.gravity}
        />
        <Text>Gravity</Text>
        <Text>Starting Pieces</Text>
        <View style={{flex: 1, flexDirection: 'column'}}>
          <Image source={require('./assets/loading.png')} style={{width: 100, height: 100, resizeMode: 'contain',}}/>
          <Image source={require('./assets/loading.png')} style={{width: 100, height: 100, resizeMode: 'contain',}}/>
          <Image source={require('./assets/loading.png')} style={{width: 100, height: 100, resizeMode: 'contain',}}/>
          <Image source={require('./assets/loading.png')} style={{width: 100, height: 100, resizeMode: 'contain',}}/>
          <Image source={require('./assets/loading.png')} style={{width: 100, height: 100, resizeMode: 'contain',}}/>
        </View>

        <Button title="Start" onPress={this._startGameAsync} />
      </View>
    );
  }

  _startGameAsync = async () => {
    this.props.navigation.navigate('App', {gravity: this.state.gravity, startingPieces: 1});
  };
}

const styles = {
  viewStyles: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#364785'
  }
}

export default Settings;