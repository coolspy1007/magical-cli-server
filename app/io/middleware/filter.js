'use strict'

module.exports = () => {
  return async (ctx, next) => {
    // filter 会在客户端发送 event 事件之后，在 controller 接收到之前执行
    // console.log('filter........')
    await next()
  }
}
