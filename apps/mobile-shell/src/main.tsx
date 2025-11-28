// Import the patch before anything else to ensure it runs first
// Note: The patch is now applied via NormalModuleReplacementPlugin in rspack.config.js

import { AppRegistry } from 'react-native';
import App from './app/App';

AppRegistry.registerComponent('MobileShell', () => App);
