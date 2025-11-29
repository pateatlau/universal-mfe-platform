// apps/mobile-shell/src/app/App.tsx
import React, { Suspense, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Federated } from '@callstack/repack/client';

// Use Federated.importModule with React.lazy
// Remote name must match exactly with rspack.config.js remotes config
const RemoteHello = React.lazy(() =>
  Federated.importModule('hello_remote', './HelloRemote')
);

const App = () => {
  const [showRemote, setShowRemote] = useState(false);

  const handleLoadRemote = () => {
    console.log('[App] Loading remote component...');
    setShowRemote(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Universal MFE Seed</Text>
      <Pressable style={styles.button} onPress={handleLoadRemote}>
        <Text style={styles.buttonText}>Load Hello Remote</Text>
      </Pressable>

      {showRemote && (
        <Suspense
          fallback={<Text style={styles.loadingText}>Loading remote…</Text>}
        >
          <RemoteHello />
        </Suspense>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#000000',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 20,
  },
});

export default App;
