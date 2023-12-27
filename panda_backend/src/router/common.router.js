const Router = require("koa-router")
const { getVersion } = require('../controller/common.controller') 
const { getAuthor } = require('../controller/common.controller')

const commonRouter = new Router({ prefix: "/common" })

commonRouter.get('/getVersion', getVersion)
commonRouter.get('/getAuthor', getAuthor)

module.exports = commonRouter