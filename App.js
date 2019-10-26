import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Main from './src/main';

export default function App() {
  return (
    <View style={styles.container}>
        <Main />
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
