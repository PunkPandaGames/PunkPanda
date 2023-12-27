const Koa = require('koa')
const app = new Koa()

const parameter = require('koa-parameter');
app.use(parameter(app));

const useRoutes = require('../router')
useRoutes(app)

const useListener = require('../utils/listener2')
useListener()

module.exports = app