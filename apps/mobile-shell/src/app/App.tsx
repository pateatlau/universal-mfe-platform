import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { HelloWorld } from '@universal-mfe-platform/ui-universal';

/**
 * Mobile Shell Application
 *
 * Simple native app for initial testing.
 * Module Federation will be configured with Re.Pack.
 */
const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <HelloWorld
          title="Mobile Shell"
          message="React Native app is running successfully!"
        />
        <Text style={styles.infoText}>
          This is the native mobile shell. Module Federation for native will be
          configured with Re.Pack.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoText: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default App;
