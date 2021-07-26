'use strict';
module.exports = {
  failed(message, data) {
    return {
      code: -1,
      message,
      data,
    };
  },

  success(message, data) {
    return {
      code: 0,
      message,
      data,
    };
  },
};
