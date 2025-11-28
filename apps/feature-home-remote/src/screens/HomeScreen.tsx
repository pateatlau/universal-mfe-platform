import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HelloWorld } from '@universal-mfe-platform/ui-universal';

/**
 * HomeScreen Component
 *
 * Universal screen component that works on both web and native.
 * Uses React Native primitives only - no DOM-specific code.
 *
 * Note: Using named function for better React Fast Refresh support
 */
function HomeScreen() {
  return (
    <View style={styles.container}>
      <HelloWorld
        title="Home Screen"
        message="This is the Home screen from feature-home-remote!"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
