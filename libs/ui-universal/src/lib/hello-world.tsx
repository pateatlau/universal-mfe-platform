import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface HelloWorldProps {
  title?: string;
  message?: string;
}

/**
 * HelloWorld Component
 * 
 * A universal component that works on both web and native platforms.
 * Uses React Native primitives only - no DOM-specific code.
 */
export const HelloWorld: React.FC<HelloWorldProps> = ({
  title = 'Hello World',
  message = 'Welcome to the Universal MFE Platform!',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.platform}>
        Platform: {typeof window !== 'undefined' ? 'Web' : 'Native'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  platform: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
});

