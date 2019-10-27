import React from 'react';
import { View, Text, Image, Switch,Button,TouchableOpacity, } from 'react-native';

class Settings extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      gravity: false,
      startingPieces: 0,
    }

    this.modeNum = 5;
    this.selectStart = this.selectStart.bind(this);
  }

  selectStart(mode){
    this.setState({startingPieces:mode});
  }

  renderSelectedButton(){
      var buttons = [];
      for (let i=0; i < 5; i++) {
        if (i != this.state.startingPieces){
              buttons.push(
              <TouchableOpacity style={styles.startStyle} onPress={ () => this.selectStart(i) }>
                <Image source={require('./assets/start1.png')} style={{width: 100, height: 50, resizeMode: 'contain',}}/>
              </TouchableOpacity>
              )
        } else{
            buttons.push(
              <TouchableOpacity style={styles.selectedStartStyle} onPress={ () => this.selectStart(i) }>
                <Image source={require('./assets/start1.png')} style={{width: 100, height: 50, resizeMode: 'contain',}}/>
              </TouchableOpacity>
            )
        }
      }

      return buttons;
  }

  renderHoldView(){
        if(this.state.holdPiece[0].id!='-1'){
            return <Preview blocks={this.state.holdPiece} />
        }
  }

  render() {
    return (
      <View style={styles.viewStyles}>
        <Text style={{color:'white', fontWeight: '700', margin:20, fontSize: 26}}>SETTINGS</Text>

        <View style={{backgroundColor:'white', borderRadius: 30, padding:30, paddingLeft:50, paddingRight:50, flex:1, flexDirection:'column', alignItems:'center'}}>

          <View style = {{flexDirection:'row', alignItems:'flex-start', justifyContent:'center', margin:10}}>
            <View><Switch onValueChange={(value) => this.setState({gravity: value})}
              value={this.state.gravity}
            /></View>
            <Text style={styles.subHeading}>GRAVITY</Text>
          </View>
          <Text style={styles.subHeading}>STARTING PIECES</Text>
          <View style={{flexDirection: 'column', margin:10}}>
            {this.renderSelectedButton()}
          </View>

          <TouchableOpacity style={{ backgroundColor:'#f76c6c', borderRadius:20, padding:10, paddingLeft:30, paddingRight:30, }} onPress={this._startGameAsync}>
            <Text style={{color:'white',fontWeight: '500', fontSize: 15,}}>START</Text>
          </TouchableOpacity>

        </View>
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
    backgroundColor: '#364785',
    padding:50,
  },
  startStyle: {
    margin:5,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#364785',
    paddingLeft:10,
    paddingRight:10,
    height:60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedStartStyle:{
    margin:5,
    borderWidth: 4,
    borderRadius: 10,
    borderColor: '#f76c6c',
    paddingLeft:10,
    paddingRight:10,
    height:60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subHeading: {
    color:'#364785',
    fontWeight: '700',
    fontSize: 22,
    margin:3

  }
}

export default Settings;
