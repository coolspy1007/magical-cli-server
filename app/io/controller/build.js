'use strict'
const createCloudBuildTask = require('../../models/CloudBuildTask')
const {
  OSS_DEV_BUCKET,
  OSS_PROD_BUCKET,
  DOMAIN_NAME,
  DOMAIN_DEV_PORT,
  DOMAIN_PROD_PORT,
} = require('../../../config/constant')

module.exports = app => {
  class Controller extends app.Controller {
    async index() {
      const { ctx, app } = this
      const { socket, helper, logger } = ctx
      // 拿到 CloudBuildTask 对象
      const CloudBuildTask = await createCloudBuildTask(ctx, app)
      try {
        // 构建前准备
        await this.prepare(CloudBuildTask)
        await this.download(CloudBuildTask)
        await this.install(CloudBuildTask)
        await this.build(CloudBuildTask)
        socket.emit(
          'build',
          helper.formatMsg('build success', {
            message: '云构建任务完成，准备进行云发布',
          })
        )
        await this.prePublish(CloudBuildTask)
        await this.publish(CloudBuildTask)
        const siteDomain = CloudBuildTask._prod
          ? OSS_PROD_BUCKET
          : OSS_DEV_BUCKET
        const portDomain = CloudBuildTask._prod
          ? DOMAIN_PROD_PORT
          : DOMAIN_DEV_PORT
        let fllDomain = ''
        // 如果是域名加上二级域名前缀，IP则是 IP+端口
        if (/^\w+\.\w+$/.test(DOMAIN_NAME)) {
          fllDomain = `${siteDomain}.${DOMAIN_NAME}`
        } else {
          fllDomain = `${DOMAIN_NAME}:${portDomain}`
        }

        socket.emit(
          'success',
          helper.formatMsg('task success', {
            message: `云构建成功，访问链接：http://${fllDomain}/${CloudBuildTask._name}`,
          })
        )
        socket.disconnect() // 任务完成够断开 socket 连接
      } catch (error) {
        logger.error('云构建任务失败，失败原因：' + error.message)
        socket.emit(
          'build',
          helper.formatMsg('error', {
            message: '云构建任务失败，失败原因：' + error.message,
          })
        )
        socket.disconnect()
      }
    }

    async prepare(cloudBuildTask) {
      const { socket, helper } = this.ctx
      socket.emit(
        'build',
        helper.formatMsg('prepare', {
          message: '开始执行构建前的准备工作',
        })
      )
      await cloudBuildTask.prepare()
    }

    async download(cloudBuildTask) {
      const { socket, helper } = this.ctx
      socket.emit(
        'build',
        helper.formatMsg('download', {
          message: '开始下载源码',
        })
      )
      await cloudBuildTask.download()
    }

    async install(cloudBuildTask) {
      const { socket, helper } = this.ctx
      socket.emit(
        'build',
        helper.formatMsg('install', {
          message: '开始安装依赖',
        })
      )
      try {
        await cloudBuildTask.install()
      } catch (error) {
        socket.emit(
          'failed',
          helper.formatMsg('install failed', {
            message: `依赖安装失败 ${
              error.message ? '失败原因：' + error.message : ''
            }`,
          })
        )
      }
    }

    async build(cloudBuildTask) {
      const { socket, helper } = this.ctx
      socket.emit(
        'build',
        helper.formatMsg('build', {
          message: '开始构建',
        })
      )
      try {
        await cloudBuildTask.build()
      } catch (error) {
        socket.emit(
          'failed',
          helper.formatMsg('build failed', {
            message: `构建失败 ${
              error.message ? '失败原因：' + error.message : ''
            }`,
          })
        )
      }
    }
    async prePublish(cloudBuildTask) {
      const { socket, helper } = this.ctx
      socket.emit(
        'build',
        helper.formatMsg('pre publish', {
          message: '开始发布前准备',
        })
      )
      await cloudBuildTask.prePublish()
    }
    async publish(cloudBuildTask) {
      const { socket, helper } = this.ctx
      socket.emit(
        'build',
        helper.formatMsg('publish', {
          message: '开始进行云发布任务',
        })
      )
      const publishRes = await cloudBuildTask.publish()
      if (publishRes) {
        socket.emit(
          'build',
          helper.formatMsg('publish success', {
            message: '发布成功',
          })
        )
      } else {
        socket.emit(
          'failed',
          helper.formatMsg('publish error', {
            message: '发布失败，失败原因：' + publishRes.message,
          })
        )
      }
    }
  }
  return Controller
}
