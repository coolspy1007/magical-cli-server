'use strict';
const mongoose = require('mongoose');

const { MONGODB_CONFIG } = require('./config');
const { url, dbName, useUnifiedTopology, useNewUrlParser, useFindAndModify } =
  MONGODB_CONFIG;
mongoose.set('useFindAndModify', useFindAndModify);
mongoose.connect(`${url}/${dbName}`, {
  useUnifiedTopology,
  useNewUrlParser,
});

const db = mongoose.connection;

db.on('error', err => {
  console.error(err);
});
// db.once('open', () => {
//   console.log('mongodb connected')
// })
module.exports = mongoose;
