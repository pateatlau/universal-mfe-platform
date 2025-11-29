import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

// Remote loading function
async function loadRemoteComponent() {
  const container = await import('hello_remote/HelloRemote');
  return container.default;
}

function App() {
  const [RemoteComponent, setRemoteComponent] =
    useState<React.ComponentType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoadRemote = async () => {
    setLoading(true);
    try {
      const Component = await loadRemoteComponent();
      setRemoteComponent(() => Component);
    } catch (error) {
      console.error('Failed to load remote:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Universal MFE Seed</Text>
      <Pressable
        style={styles.button}
        onPress={handleLoadRemote}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : 'Load Hello Remote'}
        </Text>
      </Pressable>
      {RemoteComponent && (
        <View style={styles.remoteContainer}>
          <RemoteComponent />
        </View>
      )}
    </View>
  );
}

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
  remoteContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
});

export { App };
