'use strict';
const MONGODB_CONFIG = {
  url: 'mongodb://127.0.0.1:27017',
  dbName: 'magical-cli',
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
};

module.exports = {
  MONGODB_CONFIG,
};
