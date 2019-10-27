/**
 * Created by ggoma on 2016. 11. 23..
 */
import React, {Component} from 'react';
import {
View,
Text,
StyleSheet
} from 'react-native';

import Grid from './components/grid';

export default class Main extends Component {

  constructor(props) {
    super(props);

    this.gravity = props.gravity;
    this.init = props.init;
    this.navigate = props.navigate;

  }

    render() {
        return (
            <View style={styles.container}>
                <Grid w={10} h={24} gravity={this.gravity} init={this.init} navigate={this.navigate}/>
            </View>
        )
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
    },

})
