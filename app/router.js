'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, io } = app
  router.get('/project/getTemplate', controller.project.getTemplate)
  router.get('/oss/get', controller.oss.get)
  // socket.io
  // io.of('/').route('build', io.controller.build.index)
  // 如果 namespace 为 '/' 则 .of('/') 可省略
  // 当客户端发送 build 事件时，会分配给 controller 下的 build.index 方法来执行
  io.route('build', io.controller.build.index)
}
