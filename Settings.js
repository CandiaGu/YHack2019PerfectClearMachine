import React from 'react';
import { View, Text, Image, Switch,Button,TouchableOpacity, } from 'react-native';

class Settings extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      gravity: false,
      startingPieces: 1
    }


    this.selectStart = this.selectStart.bind(this);
  }

  selectStart(mode){
    this.setState({startingPieces:mode});
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
          <TouchableOpacity onPress={ () => this.selectStart(1) }>
            <Image source={require('./assets/start1.png')} style={{width: 100, height: 100, resizeMode: 'contain',}}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={ () => this.selectStart(2) }>
            <Image source={require('./assets/start2.png')} style={{width: 100, height: 100, resizeMode: 'contain',}}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={ () => this.selectStart(3) }>
            <Image source={require('./assets/start3.png')} style={{width: 100, height: 100, resizeMode: 'contain',}}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={ () => this.selectStart(4) }>
            <Image source={require('./assets/start4.png')} style={{width: 100, height: 100, resizeMode: 'contain',}}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={ () => this.selectStart(5) }>
            <Image source={require('./assets/start5.png')} style={{width: 100, height: 100, resizeMode: 'contain',}}/>
          </TouchableOpacity>
        </View>

        <Button title="Start" onPress={this._startGameAsync} />
      </View>
    );
  }

  _startGameAsync = async () => {
    this.props.navigation.navigate('App', {gravity: this.state.gravity, startingPieces: this.state.startingPieces});
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
