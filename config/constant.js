const fs = require('fs')
const path = require('path')
const userHome = require('os').homedir()
const { readFile } = require('../app/utils/tools')

const CLI_HOME = '.magical-cli'
module.exports = {
  INSTALL_COMMAND: 'npm install --registry=https://registry.npm.taobao.org', // 安装依赖命令
  REDIS_CLOUD_BUILD_PREFIX: 'magical_cloud_build:', // 云构建任务 redis key 前缀
  CLI_HOME, // 主目录名称
  OSS_ALI_ACCESS_KEY_ID: 'LTAI5tHAHWzQfVjxnqhMpDih', // 阿里云 API AccessKey ID
  OSS_ALI_ACCESS_KEY_SECRET: readFile(
    path.resolve(userHome, CLI_HOME, 'oss_ali_access_key') // 阿里云 API AccessKey Secret （安全考虑 存放在缓存文件中）
  ),
  OSS_PROD_BUCKET: 'magical-cli', // 正式版本上传的 OSS bucket 名称
  OSS_DEV_BUCKET: 'magical-cli-develop', // 测试版本上传的 OSS bucket 名称
  OSS_BUCKET_REGION: 'oss-cn-shenzhen', // bucket 对应的 region 地域
  DOMAIN_OSS_NAME: 'magical.ren', // OSS 发布域名
  DOMAIN_SSH_NAME: '120.78.206.254', // 指定服务器 发布域名
  SSH_:'8000', // 正式版端口
  DOMAIN_DEV_PORT:'10000',  // 测试版端口
  DOMAIN_PROD_PORT:'8000', // 正式版端口
}
