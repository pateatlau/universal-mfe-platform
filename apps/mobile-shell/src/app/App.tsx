import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
// Using relative import temporarily until Metro alias resolution is fixed
import { HelloWorld } from '../../../../libs/ui-universal/src/index';

/**
 * Mobile Shell Application
 *
 * This is the host application that loads remote micro-frontends
 * via Module Federation using Re.Pack.
 * 
 * For now, we show a simple UI. Module Federation will be enabled
 * once Re.Pack is fully configured.
 */
const App: React.FC = () => {
  const [showRemote, setShowRemote] = useState(false);
  const [isRepackMode, setIsRepackMode] = useState(false);

  useEffect(() => {
    // Check if running with Re.Pack (Module Federation available)
    try {
      // @ts-ignore - Re.Pack client may not be available
      const repackClient = require('@callstack/repack/client');
      if (repackClient?.ScriptManager?.shared) {
        setIsRepackMode(true);
        
        // Configure ScriptManager for loading remote chunks
        repackClient.ScriptManager.shared.addResolver(async (scriptId: string, caller: string) => {
          const resolveURL = repackClient.Federated.createURLResolver({
            containers: {
              feature_home_remote: `http://localhost:9000/${Platform.OS}/[name][ext]`,
            },
          });

          const url = resolveURL(scriptId, caller);
          if (url) {
            return { url };
          }
          return undefined;
        });
      }
    } catch (e) {
      // Re.Pack not available (running with Metro)
      console.log('[App] Running with Metro bundler (Re.Pack not available)');
      setIsRepackMode(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mobile Shell</Text>
        <Text style={styles.headerSubtitle}>
          {isRepackMode ? 'Re.Pack + Module Federation' : 'Metro Bundler'}
        </Text>
      </View>

      <View style={styles.content}>
        <HelloWorld
          title="Mobile Shell"
          message="React Native app is running successfully!"
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Status</Text>
          <Text style={styles.infoText}>
            Bundler: {isRepackMode ? 'Re.Pack' : 'Metro'}
          </Text>
          <Text style={styles.infoText}>
            Platform: {Platform.OS}
          </Text>
        </View>

        {!isRepackMode && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Module Federation Setup</Text>
            <Text style={styles.warningText}>
              To use Module Federation on native:
            </Text>
            <Text style={styles.warningCode}>
              1. npm run start:mobile:remote
            </Text>
            <Text style={styles.warningCode}>
              2. npm run start:mobile:repack
            </Text>
            <Text style={styles.warningCode}>
              3. npm run start:mobile:android
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#c7d2fe',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoBox: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1e3a8a',
    marginBottom: 8,
  },
  warningBox: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 8,
  },
  warningCode: {
    fontSize: 13,
    color: '#92400e',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#fef9c3',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
    overflow: 'hidden',
  },
});

export default App;
