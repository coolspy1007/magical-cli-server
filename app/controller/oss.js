'use strict'

const Controller = require('egg').Controller
const OSS = require('../models/OSS')
const { OSS_DEV_BUCKET, OSS_PROD_BUCKET } = require('../../config/constant')
const { failed, success } = require('../utils/requestRes')

class OssController extends Controller {
  /**
   * 获取上传到 OSS 的项目文件信息
   */
  async get() {
    const { ctx } = this
    let ossProjectType = ctx.query.type // 发布类型 是否是正式版
    const projectName = ctx.query.projectName // 项目名称
    const fileName = ctx.query.fileName ? ctx.query.fileName : '' // 要查找的文件名
    if (!projectName) {
      ctx.body = failed('项目名称不存在')
      return
    }
    // 根据传入 type 获取对应 OSS bucket
    let oss
    if (ossProjectType === 'prod') {
      oss = new OSS(OSS_PROD_BUCKET)
    } else {
      oss = new OSS(OSS_DEV_BUCKET)
    }
    try {
      const { objects } = await oss.list(`${projectName}/${fileName}`)
      if (objects) {
        ctx.body = success('获取 OSS 上传文件成功', objects)
      } else {
        ctx.body = failed('获取 OSS 上传文件失败')
      }
    } catch (error) {
      ctx.body = failed(error.message)
    }
  }
}

module.exports = OssController
