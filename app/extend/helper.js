'use strict';

module.exports = {
  // 规范发送消息格式
  formatMsg(action, payload = {}, metaData = {}) {
    const meta = Object.assign(
      {},
      {
        timestamp: Date.now(),
      },
      metaData
    );
    return {
      meta,
      data: {
        action,
        payload,
      },
    };
  },
};
