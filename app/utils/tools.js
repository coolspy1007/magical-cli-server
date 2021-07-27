'use strict';
/**
 * @description 工具函数
 * @author 起点丶
 */
const fs = require('fs');
/**
 * 判断是否为 object
 * @param target
 * @return {boolean}
 */
const isObject = target => {
  return Object.prototype.toString.call(target) === '[object Object]';
};

/**
 * 兼容 windows 的 spawn 方法
 * @param command  命令
 * @param args  参数
 * @param options
 * @return {ChildProcessWithoutNullStreams}
 */
function spawn(command, args, options) {
  const isWindows = process.platform === 'win32';
  const cmd = isWindows ? 'cmd' : command;
  let cmdArgs = isWindows ? [ '/c' ].concat(command, args) : args;
  // 将参数中 \\ 替换为 /  不然windows会报错
  cmdArgs = cmdArgs.map(value => value.replace(/\\/g, '/'));
  // console.log(cmdArgs)
  return require('child_process').spawn(cmd, cmdArgs, options);
}

/**
 * 异步调用 spawn 做 error 和 exit 的监听
 * @param command
 * @param args
 * @param options
 * @param stdout
 * @param stderr
 * @return {Promise<unknown>}
 */
function execAsync(command, args, options, stdout = null, stderr = null) {
  return new Promise((resolve, reject) => {
    const cp = spawn(command, args, options);
    cp.on('error', err => {
      reject(err);
    });
    cp.on('exit', code => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(code);
      }
    });
    if (stdout) {
      cp.stdout.on('data', stdout);
    }
    if (stderr) {
      cp.stderr.on('data', stderr);
    }
  });
}

/**
 * 格式化命令 npm install => { cmd:'npm', args:['install'] }
 * @param cmdStr
 * @return {null|{args: string[], cmd: string}}
 */
function formatCmd(cmdStr) {
  if (!cmdStr || typeof cmdStr !== 'string') {
    return null;
  }
  const cmdArr = cmdStr.split(' ');
  const cmd = cmdArr[0];
  const args = cmdArr.slice(1);
  return { cmd, args };
}

/**
 * 读取文件内容
 * @param path 文件路径
 * @param options 选项  toJson json形式读取  默认 string
 * @return {{type: "Buffer", data: number[]}|string|null}
 */
function readFile(path, options = {}) {
  if (!fs.existsSync(path)) {
    return null;
  }
  const buffer = fs.readFileSync(path);
  if (options.toJson) {
    return buffer.toJSON();
  }
  return buffer.toString();

}

/**
 * 写入文件
 * @param path
 * @param data
 * @param reWrite 强制写入
 * @return {boolean}
 */
function writeFile(path, data, { reWrite = true } = {}) {
  if (fs.existsSync(path)) {
    if (reWrite) {
      fs.writeFileSync(path, data);
      return true;
    }
  } else {
    fs.writeFileSync(path, data);
    return true;
  }
  return false;
}

/**
 * 检查命令是否合法
 * @param {*} cmd
 */
function checkCommand(cmd) {
  const validCommands = [ 'npm', 'cnpm' ];
  const buildCmdArr = cmd.split(' ');
  if (!validCommands.includes(buildCmdArr[0])) {
    throw new Error(`非法的指令 ${cmd}`);
  }
}

/**
 * 程序休眠
 * @param time
 * @return {Promise<unknown>}
 */
async function sleep(time = 1000) {
  return new Promise(resolve => setTimeout(resolve, time));
}

module.exports = {
  isObject,
  sleep,
  formatCmd,
  execAsync,
  readFile,
  writeFile,
  checkCommand,
};
