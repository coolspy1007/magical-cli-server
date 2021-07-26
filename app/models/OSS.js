'use strict';
const Ali_OSS = require('ali-oss');
const {
  OSS_ALI_ACCESS_KEY_SECRET,
  OSS_ALI_ACCESS_KEY_ID,
  OSS_BUCKET_REGION,
} = require('../../config/constant');

class OSS {
  constructor(bucket) {
    this.bucket = bucket;
    this.oss = new Ali_OSS({
      accessKeyId: OSS_ALI_ACCESS_KEY_ID,
      accessKeySecret: OSS_ALI_ACCESS_KEY_SECRET,
      region: OSS_BUCKET_REGION,
      bucket,
    });
  }

  /**
   * 上传文件至 OSS bucket
   * @param {string} name 文件名称 test/index.html  前边加上存储文件夹
   * @param {string} path 文件路径
   * @param {object} options
   */
  async put(name, path, options = {}) {
    await this.oss.put(name, path, options);
  }

  /**
   * 获取 bucket 中上传的文件
   * @param {string} prefix
   * @return
   */
  async list(prefix) {
    return this.oss.list({
      prefix,
    //    delimiter: '/'  // 只获取当前目录下的文件
    });
  }
}

module.exports = OSS;
