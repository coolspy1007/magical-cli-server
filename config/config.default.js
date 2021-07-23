/* eslint valid-jsdoc: "off" */

'use strict'
const REDIS_PORT = 6379
const REDIS_HOST = '127.0.0.1'
const REDIS_PASSWORD = ''
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {})

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1625917324456_9261'

  // add your middleware config here
  config.middleware = []

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  }

  config.redis = {
    client: {
      port: REDIS_PORT, // Redis port
      host: REDIS_HOST, // Redis host
      password: REDIS_PASSWORD,
      db: 0,
    },
  }

  config.io = {
    init: {}, // passed to engine.io
    namespace: {
      '/': {
        connectionMiddleware: ['auth'],
        packetMiddleware: ['filter'],
      }
    },
  }
  return {
    ...config,
    ...userConfig,
  }
}
