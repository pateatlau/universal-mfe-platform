import React, { Suspense, lazy } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

/**
 * Lazy load remote components
 * In production, these would be loaded via manifest
 */
const HomeScreen = lazy(() =>
  import('feature_home_remote/HomeScreen').catch(() => ({
    default: () => (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load Home Screen</Text>
      </View>
    ),
  }))
);

/**
 * Loading fallback component
 */
const LoadingFallback: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#666666" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

const Stack = createNativeStackNavigator();

/**
 * Mobile Shell Application
 * 
 * Host application that handles navigation and loads remotes via Module Federation.
 */
const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          options={{ title: 'Home' }}
        >
          {() => (
            <Suspense fallback={<LoadingFallback />}>
              <HomeScreen />
            </Suspense>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
  },
});

export default App;

