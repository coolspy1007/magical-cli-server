'use strict';

const Controller = require('egg').Controller;
const Project = require('../db/models/Project');
// const { failed, success } = require('../utils/requestRes');

class ProjectController extends Controller {
  // 获取项目模板信息
  async getTemplate() {
    const { ctx } = this;
    const projectData = await Project.find();
    ctx.body = projectData;
  }
}

module.exports = ProjectController;
