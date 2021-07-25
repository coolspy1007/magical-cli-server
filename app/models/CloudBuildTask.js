'use strict'
const path = require('path')
const userHome = require('os').homedir()
const fs = require('fs')
const fse = require('fs-extra')
const SimpleGit = require('simple-git')
const glob = require('glob')

const {
  CLI_HOME,
  OSS_DEV_BUCKET,
  OSS_PROD_BUCKET,
  REDIS_CLOUD_BUILD_PREFIX,
  INSTALL_COMMAND,
} = require('../../config/constant')
const { formatCmd, execAsync, checkCommand } = require('../utils/tools')
const OSS = require('../models/OSS')
/**
 * 云构建任务类
 */
class CloudBuildTask {
  constructor(data, ctx, app) {
    // console.log(data)
    this._name = data.name // 项目名称
    this._version = data.version // 项目版本
    this._branch = data.branch // 仓库分支名
    this._repo = data.repo // 仓库地址
    this._buildCmd = data.buildCmd // 构建命令
    this._type = data.type // 上传服务器类型 oss ssh
    this._prod = data.prod.toString() === 'true' // 是否正式版本发布
    this._ctx = ctx
    this._app = app
    this._logger = ctx.logger
    // 缓存项目主目录
    this._dir = path.resolve(
      userHome,
      CLI_HOME,
      'cloud_build',
      `${this._name}@${this._version}`
    )
    this._sourceCodeDir = path.join(this._dir, this._name)
    this._logger.info('缓存项目主目录：', this._dir)
    this._logger.info('缓存项目源码目录：', this._sourceCodeDir)
  }

  async prepare() {
    fse.ensureDirSync(this._dir) // 确保 缓存项目主目录 存在，不存在会自动创建
    await fse.emptyDir(this._dir) // 清空 缓存项目主目录
    const fileList = fs.readdirSync(this._dir)
    if (fileList && fileList.length > 0) {
      throw new Error('无法清空缓存目录，请重试')
    }
    this._git = new SimpleGit(this._dir) // simple-git 实例  用于操作 git
    this._oss = this.getOss(this._prod) // 拿到 OSS 实例
    // console.log(this._oss)
  }

  // 根据是否发布的正式版本，获取不同的 OSS bucket
  getOss(prod) {
    if (prod) {
      return new OSS(OSS_PROD_BUCKET)
    } else {
      return new OSS(OSS_DEV_BUCKET)
    }
  }

  // 下载源码 git clone 并切换分支拉取远程开发分支
  async download() {
    await this._git.clone(this._repo)
    this._git = new SimpleGit(this._sourceCodeDir) //切换到源码目录再操作git
    // git checkout -b dev/1.0.0 origin/dev/1.0.0
    // 先创建并切换到 dev/1.0.0 然后从远程 dev/1.0.0 下载代码
    await this._git.checkout(['-b', this._branch, `origin/${this._branch}`])
  }

  // 安装依赖
  async install() {
    const { cmd, args } = formatCmd(INSTALL_COMMAND)
    await execAsync(
      cmd,
      args,
      {
        cwd: this._sourceCodeDir,
      },
      data => {
        this._ctx.socket.emit('installing', data.toString())
      },
      err => {
        this._ctx.socket.emit('installing', err.toString())
      }
    )
  }

  // 打包构建
  async build() {
    checkCommand(this._buildCmd)
    const { cmd, args } = formatCmd(this._buildCmd)
    await execAsync(
      cmd,
      args,
      {
        cwd: this._sourceCodeDir,
      },
      data => {
        this._ctx.socket.emit('building', data.toString())
      },
      err => {
        this._ctx.socket.emit('building', err.toString())
      }
    )
  }

  // 发布前准备
  async prePublish() {
    // 检查是否完成构建，是否能找到构建后的文件
    const buildDir = this.getBuildDir()
    if (!buildDir) {
      throw new Error('未找到构建文件！')
    }
    this._buildPath = buildDir
  }

  /**
   * 获取 build 构建后的目录
   * @returns 构建目录
   */
  getBuildDir() {
    const buildDir = ['dist', 'build']
    const buildPath = buildDir.find(dir =>
      fs.existsSync(path.resolve(this._sourceCodeDir, dir))
    )
    this._ctx.logger.info('build path', buildPath)
    if (buildPath) {
      return path.resolve(this._sourceCodeDir, buildPath)
    }
    return null
  }

  /**
   * 任务结束后清除缓存及 redis 数据
   */
  async clean() {
    // 清除项目缓存目录
    if (fs.existsSync(this._dir)) {
      await fse.remove(this._dir)
    }
    console.log(`${REDIS_CLOUD_BUILD_PREFIX}:${this._ctx.socket.id}`)
    // 清除 redis 存储的本次任务的 redis 数据
    await this._app.redis.del(
      `${REDIS_CLOUD_BUILD_PREFIX}:${this._ctx.socket.id}`
    )
  }

  // 发布
  async publish() {
    // 遍历要上传的文件，并上传
    return new Promise((resolve, reject) => {
      glob(
        '**',
        {
          cwd: this._buildPath, // 要遍历的目录
          nodir: true, // 不包含空文件夹
          ignore: '**/node_modules/**', // 忽略内容
        },
        (err, files) => {
          if (err) {
            reject(err)
          } else {
            Promise.all(
              files.map(async file => {
                const filePath = path.resolve(this._buildPath, file)
                  const putRes = await this._oss.put(
                    `${this._name}/${file}`,
                    filePath
                  )
                  return putRes
              })
            )
              .then(() => {
                resolve(true)
              })
              .catch(err => {
                this._logger.info('上传OSS出错，错误原因：', err.message)
                reject(err)
              })
          }
        }
      )
    })
  }
}

/**
 * 工厂函数，创建 CloudBuildTask 对象
 * @param {ctx} ctx
 * @param {app} app
 * @returns
 */
async function createCloudBuildTask(ctx, app) {
  const { socket, helper } = ctx
  const { redis } = app
  const clientId = socket.id
  const redisKey = `${REDIS_CLOUD_BUILD_PREFIX}:${clientId}`
  const taskObj = JSON.parse(await redis.get(redisKey)) // 拿到 redis 中存储的云构建任务需要用到的 git 仓库信息及项目信息
  socket.emit(
    'build',
    helper.formatMsg('create task', {
      message: '创建云构建任务',
    })
  )
  const data = {
    repo: taskObj.repo,
    name: taskObj.name,
    branch: taskObj.branch,
    version: taskObj.version,
    buildCmd: taskObj.buildCmd,
    type: taskObj.type,
    prod: taskObj.prod,
  }
  return new CloudBuildTask(data, ctx, app)
}

module.exports = createCloudBuildTask
