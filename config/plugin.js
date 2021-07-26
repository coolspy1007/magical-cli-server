'use strict';

// /** @type Egg.EggPlugin */
// module.exports = {
//   // had enabled by egg
//   // static: {
//   //   enable: true,
//   // }
// };
exports.io = {
  enable: true,
  package: 'egg-socket.io',
};

exports.redis = {
  enable: true,
  package: 'egg-redis',
};
