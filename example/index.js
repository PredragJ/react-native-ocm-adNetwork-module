import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
// Some tooling/environments still bootstrap with the legacy "example" app key.
// Register the same component under that name to avoid redbox errors.
AppRegistry.registerComponent('example', () => App);
