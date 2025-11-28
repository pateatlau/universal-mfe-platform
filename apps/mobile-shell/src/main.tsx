/**
 * Mobile Shell Entry Point
 * 
 * This is the entry point for the React Native mobile application.
 */
import { AppRegistry } from 'react-native';
import App from './app/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

