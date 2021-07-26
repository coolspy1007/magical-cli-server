'use strict'
const createCloudBuildTask = require('../../models/CloudBuildTask')
const { REDIS_CLOUD_BUILD_PREFIX } = require('../../../config/constant')

module.exports = () => {
  return async (ctx, next) => {
    console.log('server connect')
    const { socket, logger, helper, app } = ctx
    const { redis } = app
    // 拿到客户端传来的 query ，包含 git 仓库相关信息
    const query = socket.handshake.query
    try {
      socket.emit(
        socket.id,
        // 规范发送消息格式
        helper.formatMsg('connect', {
          type: 'connect',
          message: '云构建服务连接成功',
        })
      )
      // 从 redis 中获取握手时发送的 git 已经项目相关数据，
      const redisKey = `${REDIS_CLOUD_BUILD_PREFIX}:${socket.id}`
      let taskId = await redis.get(redisKey)
      if (!taskId) {
        await redis.set(`${redisKey}`, JSON.stringify(query))
        taskId = await redis.get(redisKey)
      }
      // logger.info('query', taskId)
      await next()
      console.log('disconnect!')
      // 连接断开后清除缓存文件及 redis
      // const cloudBuildTask = await createCloudBuildTask(ctx, app)
      // await cloudBuildTask.clean()

    } catch (error) {
      // 出错后也要清除缓存文件及 redis
      // const cloudBuildTask = await createCloudBuildTask(ctx, app)
      // await cloudBuildTask.clean()
      logger.error('云构建出错，' + error.message)
    }
  }
}
