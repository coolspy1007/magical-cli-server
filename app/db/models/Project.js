const mongoose = require('../mongodb')

const ProjectSchema = mongoose.Schema({
  userName: String,
})
// model 第三个参数指定 collection 名字，不传会将 name 变为复数作为 collection 名字（projects）
// 如果没有 collection 会自动创建一个
const Project = mongoose.model('Project', ProjectSchema,'project')
module.exports = Project
