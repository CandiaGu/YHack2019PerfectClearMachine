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
<<<<<<< HEAD
=======

  constructor(props) {
    super(props);

    this.gravity = props.gravity;
    this.init = props.init;

  }

>>>>>>> 12688fa... updated settings page
    render() {
        return (
            <View style={styles.container}>
                <Grid w={10} h={24} init={0}/>
            </View>
        )
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
    },

})
