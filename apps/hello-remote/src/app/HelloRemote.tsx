import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getGreetingMessage } from '@universal-mfe-platform/shared-utils';

export function HelloRemote() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello from Remote MFE!</Text>
      <Text style={styles.greeting}>{getGreetingMessage()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  greeting: {
    fontSize: 18,
    color: '#333333',
  },
});

export default HelloRemote;

