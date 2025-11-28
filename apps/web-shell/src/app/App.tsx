import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Error fallback component for when remote fails to load
 */
const RemoteErrorFallback: React.FC = () => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>Failed to load Home Screen</Text>
    <Text style={styles.errorSubtext}>
      Make sure the remote is running on http://localhost:4201
    </Text>
  </View>
);

/**
 * Lazy load remote components
 * In production, these would be loaded via manifest
 * Note: The remote exports HomeScreen as a named export, so we need to map it to default
 */
const HomeScreen = lazy(async () => {
  try {
    const module = await import('feature_home_remote/HomeScreen');
    // The remote exports HomeScreen as a named export, map it to default for lazy()
    const Component = module.HomeScreen || module.default;
    if (!Component) {
      throw new Error('HomeScreen component not found in remote module');
    }
    return { default: Component };
  } catch (error) {
    console.warn('Failed to load HomeScreen remote:', error);
    // Return the fallback component
    return { default: RemoteErrorFallback };
  }
});

/**
 * Loading fallback component
 */
const LoadingFallback: React.FC = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

/**
 * Web Shell Application
 *
 * Host application that handles routing and loads remotes via Module Federation.
 */
const App: React.FC = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <View style={styles.container}>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <HomeScreen />
              </Suspense>
            }
          />
          <Route
            path="/home"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <HomeScreen />
              </Suspense>
            }
          />
        </Routes>
      </View>
    </BrowserRouter>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
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
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default App;
