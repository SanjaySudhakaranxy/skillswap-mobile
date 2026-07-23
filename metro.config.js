const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Completely isolate the blockList from scanning system artifact dumps
config.resolver.blockList = [
  /node_modules\/.*\/node_modules/,
  /android\/.*/,
  /ios\/.*/,
  /\.git\/.*/
];

config.resolver.useWatchman = false;

module.exports = config;
