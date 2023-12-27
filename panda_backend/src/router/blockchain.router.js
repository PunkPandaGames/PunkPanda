const Router = require("koa-router")




const { test } = require('../controller/blockchain.controller')
const { testListener } = require('../controller/blockchain.controller')
const { testFeedListener } = require('../controller/blockchain.controller')
const { getBlockchainLogs } = require('../controller/blockchain.controller')
const { getBlockchainStakeLogs } = require('../controller/blockchain.controller')
const { getBlockchainEpochLogs } = require('../controller/blockchain.controller')
const { getBlockchainPandaLogs } = require('../controller/blockchain.controller')

const { getMintInfo } = require('../controller/blockchain.controller')
const { getFeedInfo } = require('../controller/blockchain.controller')
const { getPersonalNFTInfo } = require('../controller/blockchain.controller')
const { getPersonalTokenInfo } = require('../controller/blockchain.controller')
const { getTotalFeedInfo } = require('../controller/blockchain.controller')
const { getSearchInfo } = require('../controller/blockchain.controller')
const { getExchangeRate } = require('../controller/blockchain.controller')

const blockchainRouter = new Router({ prefix: "/blockchain" })

blockchainRouter.get('/test', test)
blockchainRouter.get('/testListener', testListener)
blockchainRouter.get('/testFeedListener', testFeedListener)
blockchainRouter.get('/getBlockchainLogs', getBlockchainLogs)
blockchainRouter.get('/getBlockchainStakeLogs', getBlockchainStakeLogs)
blockchainRouter.get('/getBlockchainEpochLogs', getBlockchainEpochLogs)
blockchainRouter.get('/getBlockchainPandaLogs', getBlockchainPandaLogs)

blockchainRouter.get('/getMintInfo', getMintInfo)
blockchainRouter.get('/getFeedInfo', getFeedInfo)
blockchainRouter.get('/getPersonalNFTInfo', getPersonalNFTInfo)
blockchainRouter.get('/getPersonalTokenInfo', getPersonalTokenInfo)
blockchainRouter.get('/getTotalFeedInfo', getTotalFeedInfo)
blockchainRouter.get('/getSearchInfo', getSearchInfo)
blockchainRouter.get('/getExchangeRate', getExchangeRate)

module.exports = blockchainRouter



/*
* 
* getMintInfo
* getFeedInfo
* getPersonalNFTInfo
* getPersonalTokenInfo
* getTotalFeedInfo
* getSearchInfo
*
*/