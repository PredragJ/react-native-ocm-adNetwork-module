const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = {
  ...getDefaultConfig(__dirname),
  projectRoot: path.resolve(__dirname, 'example'),
  watchFolders: [path.resolve(__dirname, 'src')],
  resolver: {
    extraNodeModules: {
      'react-native-ocm-adnetwork-module': path.resolve(__dirname, 'src'),
    },
  },
};
