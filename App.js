import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>hello</Text>
      <Image source={require('./assets/loading.png')}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#364785',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
