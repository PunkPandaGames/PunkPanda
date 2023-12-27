const axios = require('axios')
const ethers = require('ethers')

const db = require('../db/index')
const config = require('../utils/config')
const listener = require('../utils/listener')

//var global_provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli/7c4bd124c6b735fc5b55e2cafe23a413745c8110c2d93971b72bf457663f687d");
//var web3 = new Web3("https://rpc.ankr.com/polygon_mumbai/cad74cbf673bccec783499c999f86aa25e204de2802e5fbde62a7b6683d8ee3a");
//var web3 = new Web3("https://rpc.ankr.com/eth_goerli/7c4bd124c6b735fc5b55e2cafe23a413745c8110c2d93971b72bf457663f687d");


class BlockchainController {
  async test (ctx) {
    // const myPrefixURI = await network.getProviderNetwork(ctx.query.ChainName,"alchemy")
    // console.log("my url prefix is -> ", myPrefixURI)
    var timestamp = "1702612801"

    var datetime = new Date(timestamp * 1000);
    var localdatetime = datetime.toLocaleString();
    console.log(localdatetime);

    const ret = "{\"message\":\"OK\",\"result\":\"" + localdatetime + "\"}"
    ctx.body = ret
  }

  async testListener (ctx) {
    await listener.startTransferListener()
    console.log("transfer listener start finish")
    const ret = "{\"message\":\"OK\",\"result\":\"transfer listener start finish\"}"
    ctx.body = ret
  }

  async testFeedListener (ctx) {
    await listener.startFeedListener()
    console.log("feed listener start finish")
    const ret = "{\"message\":\"OK\",\"result\":\"feed listener start finish\"}"
    ctx.body = ret
  }

  /*
  * get mint info
  */
  async getMintInfo (ctx) {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Credentials', 'true');

    console.log("getMintInfo start")
    try{
      /* total mint */
      const totalSQL = "select count(TokenID) as TotalMint from tokenmint";
      const totalResults = await db(totalSQL);
      console.log(totalResults.length)
      const totalMint = totalResults[0].TotalMint
      
      /* this hour infos */
      var timestamp = Date.now()/1000;
      var startTime = timestamp - 3600;
      var stopTime = timestamp;
      const hourSQL = "select count(*) as hourCount from tokenmint where DateTime >" + startTime + "  and DateTime <" +  stopTime;
      const hourResults = await db(hourSQL);
      console.log(hourResults.length)
      const hourCount = hourResults[0].hourCount
      
      /* recent 10 mint */
      const recentSQL = "select * from tokenmint order by DateTime desc limit 7";
      const recentResults = await db(recentSQL);
      console.log(recentResults.length)
  
      /* return info */
      let ret = "{\"code\":1,\"status\":\"OK\",\"result\":{\"TotalMint\": \"" + totalMint.toString() + "\",\"HourCount\": \"" + hourCount.toString() + "\",\"CurrentInfo\":["
      for(let i=0; i<recentResults.length; i++) {
        const loopstring = "{\"TokenId\":\"" + recentResults[i].TokenID + "\",\"OwnerAddress\":\"" + recentResults[i].Owner + "\",\"TokenMintValue\":\"100000000000000000\",\"TokenMintSymbol\":\"vic\",\"MintDate\":\"" + recentResults[i].DateTime + "\"}"
        ret += loopstring
        if(i != (recentResults.length - 1))
          ret += ","
      }
      ret += "]}}"
      ctx.body = ret
    } catch(err) {
      console.log('getMintInfo err is ->', err)
      const ret = "{\"code\":200,\"status\":\"Fail\",\"result\":\"" + err.toString() + "\"}"
      ctx.body = ret
    }
  }

  /*
  * get feed info
  */
  async getFeedInfo (ctx) {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Credentials', 'true');

    ctx.verifyParams({
      SearchTimeStamp:{ 
        type:'string',
        required:true 
      }
    });

    const ExchangeRate = 1
    const DailyFeedLimit = 2000 * 1000000000000000000
    
    try{
      /* get total feed value by time */
      const totalSQL = "select sum(FeedValue) as TotalValue from pandafeed where FeedTime<='" + ctx.query.SearchTimeStamp + "'";
      const totalResults = await db(totalSQL);
      console.log(totalResults.length)
      const totalFeedValue = totalResults[0].TotalValue
      var currentProcess = (totalFeedValue / DailyFeedLimit) * 100
      currentProcess = currentProcess.toFixed(2);
      
      /* get recent 5 records by time */
      const recentSQL = "select * from pandafeed order by FeedTime desc limit 5";
      const recentResults = await db(recentSQL);
      console.log(recentResults.length)

      /* return info */
      let ret = "{\"code\":1,\"status\":\"OK\",\"result\":{\"TodayProgross\": \"" + currentProcess.toString() + "\",\"TodayValue\":\"" + totalFeedValue.toString() + "\",\"TokenName\":\"VIC\",\"FeedInfo\":["
      for(let i=0; i<recentResults.length; i++) {
        const tokenValue = ExchangeRate
        const loopstring = "{\"FeedAddress\":\"" + recentResults[i].FeedAddress + "\",\"FeedToken\":\"" + recentResults[i].FeedValue + "\",\"FeedValue\":\"" + tokenValue + "\",\"FeedValueSymbol\":\"$\",\"FeedDate\":\"" + recentResults[i].FeedTime + "\"}"
        ret += loopstring
        if(i != (recentResults.length - 1))
          ret += ","
      }
      ret += "]}}"
      ctx.body = ret
    } catch(err) {
      console.log('getFeedInfo err is ->', err)
      const ret = "{\"code\":200,\"status\":\"Fail\",\"result\":\"" + err.toString() + "\"}"
      ctx.body = ret
    }
  }

  /*
  * getPersonalNFTInfo
  */
  async getPersonalNFTInfo (ctx) {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Credentials', 'true');

    ctx.verifyParams({
      UserAddress:{ 
        type:'string',
        required:true 
      }
    });

    try{
      /* get owner info */
      const recentSQL = "select * from tokenmint where Owner='" + ctx.query.UserAddress + "'";
      const recentResults = await db(recentSQL);
      console.log(recentResults.length);
  
      /* return info */
      let ret = ""
      if(recentResults.length > 0) {
        ret = "{\"code\":1,\"status\":\"OK\",\"result\":{\"TotalCount\": \"" + recentResults.length + "\",\"TokenInfo\":["
        for(let i=0; i<recentResults.length; i++) {
          const loopstring = "{\"TokenID\":\"" + recentResults[i].TokenID + "\",\"MintTime\":\"" + recentResults[i].DateTime + "\"}"
          ret += loopstring
          if(i != (recentResults.length - 1))
            ret += ","
        }
        ret += "]}}"
      } else {
        ret = "{\"code\":1,\"status\":\"OK\",\"result\":{\"TotalCount\": \"0\",\"TokenInfo\":[]}}"
      }
      ctx.body = ret
    } catch(err) {
      console.log('getFeedInfo err is ->', err)
      let errRet = "{\"code\":200,\"status\":\"Fail\",\"result\":\"" + err.toString() + "\"}"
      ctx.body = errRet
    }
  }

  /*
  * getPersonalTokenInfo
  */
  async getPersonalTokenInfo (ctx) {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Credentials', 'true');

    ctx.verifyParams({
      UserAddress:{ 
        type:'string',
        required:true 
      },
      StartOffset:{ 
        type:'string',
        required:false 
      },
      PageLimit:{ 
        type:'string',
        required:false 
      },
    });


    try {
      /* total token info */
      const totalSQL = "select count(DropBalance) as TotalBalance from droptoken where DropAddress='" + ctx.query.UserAddress + "'";
      const totalResults = await db(totalSQL);
      console.log(totalResults.length)
      const totalDropBalance = totalResults[0].TotalBalance
      var tempPageLimit = 0
      var tempStartOffset = 0

      /* lastest info */
      if(ctx.query.PageLimit)
        tempPageLimit = ctx.query.PageLimit
      else
        tempPageLimit = 10
  
      if(ctx.query.StartOffset)
        tempStartOffset = ctx.query.StartOffset
      else
        tempStartOffset = 0
      const recentSQL = "select * from droptoken where DropAddress='" + ctx.query.UserAddress + "' order by DropTime desc limit " + tempPageLimit.toString() + " offset " + tempStartOffset.toString();
      const recentResults = await db(recentSQL);
      console.log(recentResults.length)

      /* return info */
      let ret = ""
      if(recentResults.length > 0) {
        ret = "{\"code\":1,\"status\":\"OK\",\"result\":{\"TotalBalance\": \"" + totalDropBalance.toString() + "\",\"CurrentInfo\":["
        for(let i=0; i<recentResults.length; i++) {
          const loopstring = "{\"DropTime\":\"" + recentResults[i].DropTime + "\",\"DropBalance\":\"" + recentResults[i].DropBalance + "\"}"
          ret += loopstring
          if(i != (recentResults.length - 1))
            ret += ","
        }
        ret += "]}}"
      } else {
        ret = "{\"code\":1,\"status\":\"OK\",\"result\":{\"TotalBalance\": \"0\",\"CurrentInfo\":[]}}"
      }
      ctx.body = ret
    } catch(err) {
      console.log('getPersonalTokenInfo err is ->', err)
      let errRet = "{\"code\":200,\"status\":\"Fail\",\"result\":\"" + err.toString() + "\"}"
      ctx.body = errRet
    }
  }

  /*
  * getTotalFeedInfo
  */
  async getTotalFeedInfo (ctx) {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Credentials', 'true');

    ctx.verifyParams({
      OffsetPage:{
        type:'string',
        required:true 
      }
    });

    console.log('start getTotalFeedInfo,OffsetPage is ->', ctx.query.OffsetPage)

    try {
      const TotalAddressSQL = "select count(distinct FeedAddress) as TotalAddress from views_dailyfeed";
      const TotalAddressResults = await db(TotalAddressSQL);
      console.log('AddressResults is ->', TotalAddressResults.length)
      //const TotalAddress = AddressResults[0].TotalAddress
      var TotalAddress = "0"
      if (TotalAddressResults.length > 0)
        TotalAddress = TotalAddressResults[0].TotalAddress
      
      const TatalBalanceSQL = "select COALESCE(sum(total_value), 0) as TotalBalance from views_dailyfeed";
      const TatalBalanceResults = await db(TatalBalanceSQL);
      console.log('AddressResults is ->', TatalBalanceResults.length)
      //const TotalAddress = AddressResults[0].TotalAddress
      var TatalBalance = "0"
      if (TatalBalanceResults.length > 0)
        TatalBalance = TatalBalanceResults[0].TotalBalance


      let realOffset = parseInt(ctx.query.OffsetPage)
      if (realOffset > 0)
        realOffset = ((realOffset - 1) * 28);
      else
        realOffset = 0
      const recentSQL = "select a.RoundNumber as live_days,count(b.FeedAddress) as ownernumber,COALESCE(SUM(b.total_value), 0) as dailybalance from epochtime a left join views_dailyfeed b on a.RoundNumber=b.live_days group by a.RoundNumber limit 28 offset " + realOffset.toString();
      console.log('recentSQL is ->',recentSQL)
      const recentResults = await db(recentSQL);
      console.log('recentResults is ->', recentResults.length)
      /* return info */
      let ret = ""
      if(recentResults.length > 0) {
        ret = "{\"code\":1,\"status\":\"OK\",\"result\":{\"TotalAddress\":\"" + TotalAddress.toString() + "\",\"TatalBalance\":\"" + TatalBalance.toString() + "\",\"DailyInfo\":["
        for(let i=0; i<recentResults.length; i++) {
          const loopstring = "{\"EpochNumber\":\"" + recentResults[i].live_days + "\",\"OwnerNumber\":\"" + recentResults[i].ownernumber + "\",\"DailyBalance\":\"" + recentResults[i].dailybalance + "\"}"
          ret += loopstring
          if(i != (recentResults.length - 1))
            ret += ","
        }
        ret += "]}}"
      } else {
        ret = "{\"code\":1,\"status\":\"OK\",\"result\":{\"TotalAddress\":\"0\",\"TatalBalance\":\"0\",\"DailyInfo\":[]}}"
      }
      ctx.body = ret
    } catch(err) {
      console.log('getTotalFeedInfo err is ->', err)
      let errRet = "{\"code\":200,\"status\":\"Fail\",\"result\":\"" + err.toString() + "\"}"
      ctx.body = errRet
    }
  }

  /*
  * getSearchInfo
  */
  async getSearchInfo (ctx) {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Credentials', 'true');

    ctx.verifyParams({
      Epoch:{
        type:'string',
        required:true 
      },
      SearchAddress:{
        type:'string',
        required:true 
      }
    });

    try{
      let ExchangeRate = 1
      /* total feed address */
      /* get start time and stop time */
      const searchSQL = "select * from epochtime where RoundNumber='" + ctx.query.Epoch + "'";
      const searchResults = await db(searchSQL);
      console.log('searchResults is ->', searchResults.length)
      if(searchResults.length == 1) {
        const startTime = searchResults[0].EpochStart
        const stopTime = searchResults[0].EpochEnd
        
        /* total feed address */
        const AddressSQL = "select count(distinct FeedAddress) as TotalAddress from pandafeed where FeedTime>'" + startTime + "' and FeedTime<='" + stopTime + "'";
        const AddressResults = await db(AddressSQL);
        console.log('AddressResults is ->', AddressResults.length)
        //const TotalAddress = AddressResults[0].TotalAddress
        var TotalAddress = 0
        if (AddressResults.length > 0)
          TotalAddress = AddressResults[0].TotalAddress
        
        /* total feed value */
        const BalanceSQL = "select sum(FeedValue) as TotalValue from pandafeed where FeedTime>'" + startTime + "' and FeedTime<='" + stopTime + "'";
        const BalanceResults = await db(BalanceSQL);
        console.log('BalanceResults is ->', BalanceResults.length)
        //const TotalBalance = BalanceResults[0].TotalValue
        var TotalBalance = 0
        if (BalanceResults.length > 0)
          TotalBalance = BalanceResults[0].TotalValue
        
        /* airdrop info */
        const AirdropSQL = "select * from droptoken where  DropAddress='" + ctx.query.SearchAddress + "' and DropTime>'" + startTime + "' and DropTime<='" + stopTime + "'";
        const AirdropResults = await db(AirdropSQL);
        console.log('AirdropResults is ->', AirdropResults.length)
        var AirdropBalance = 0
        if (AirdropResults.length > 0)
          AirdropBalance = AirdropResults[0].TotalValue

        /* detail feed info */
        const recentSQL = "select * from pandafeed where FeedTime>'" + startTime + "' and FeedTime<='" + stopTime + "' order by FeedTime desc";
        const recentResults = await db(recentSQL);
        console.log('recentResults is ->', recentResults.length)
        
        let ret = ""
        if(recentResults.length > 0) {
          ret = "{\"code\":1,\"status\":\"OK\",\"result\":{\"TotalAddress\": \"" + TotalAddress.toString() + "\",\"TotalBalance\": \"" + TotalBalance.toString() + "\",\"AirdropBalance\": \""+AirdropBalance.toString() + "\",\"ExchangeRate\": \""+ ExchangeRate.toString() + "\",\"FeedInfo\":["
          for(let i=0; i<recentResults.length; i++) {
            const loopstring = "{\"FeedAddress\":\"" + recentResults[i].FeedAddress + "\",\"FeedValue\":\"" + recentResults[i].FeedValue + "\",\"FeedTime\":\"" + recentResults[i].FeedTime + "\"}"
            ret += loopstring
            if(i != (recentResults.length - 1))
              ret += ","
          }
          ret += "]}}"
        } else {
          ret = "{\"code\":1,\"status\":\"OK\",\"result\":{\"TotalAddress\": \"" + TotalAddress.toString() + "\",\"TotalBalance\": \"" + TotalBalance + "\",\"AirdropBalance\": \"" + AirdropBalance.toString() + "\",\"ExchangeRate\": \""+ ExchangeRate.toString() + "\",\"FeedInfo\":[]}}"
        }
        ctx.body = ret
      } else { 
        /* cannot get the correct epoch */
        console.log("getSearchInfo can not get the corret epoch->",ctx.query.Epoch)
        let errRet = "{\"code\":301,\"status\":\"Fail\",\"result\":\"can not find the epoch info,please check it\"}"
        ctx.body = errRet
      }
    } catch(err) {
      console.log('getSearchInfo err is ->', err)
      let errRet = "{\"code\":200,\"status\":\"Fail\",\"result\":\"" + err.toString() + "\"}"
      ctx.body = errRet
    }
  }

  /*
  * getExchangeRate
  */
  async getExchangeRate (ctx) {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Credentials', 'true');

    try {
      let ExchangeRate = 1
      let ret = "{\"code\":1,\"status\":\"OK\",\"result\":{\"ExchangeRate\": \"" + ExchangeRate.toString() + "\"}}"
      ctx.body = ret
    } catch(err) {
      console.log('getExchangeRate err is ->', err)
      let errRet = "{\"code\":200,\"status\":\"Fail\",\"result\":\"" + err.toString() + "\"}"
      ctx.body = errRet
    }
  }

  async getBlockchainLogs(ctx) {
    try {
      // getevent
      await listener.getEventTicket()
      console.log("getBlockchainLogs finish")
      const ret = "{\"message\":\"OK\",\"result\":\"getBlockchainLogs finish\"}"
      ctx.body = ret
    } catch(err) {
      console.log('getBlockchainLogs err is ->', err)
      let errRet = "{\"code\":200,\"status\":\"Fail\",\"result\":\"" + err.toString() + "\"}"
      ctx.body = errRet
    }
  }

  async getBlockchainStakeLogs(ctx) {
    try {
      // getevent
      await listener.getEventStake()
      console.log("getBlockchainStakeLogs finish")
      const ret = "{\"message\":\"OK\",\"result\":\"getBlockchainStakeLogs finish\"}"
      ctx.body = ret
    } catch(err) {
      console.log('getBlockchainStakeLogs err is ->', err)
      let errRet = "{\"code\":200,\"status\":\"Fail\",\"result\":\"" + err.toString() + "\"}"
      ctx.body = errRet
    }
  }

  async getBlockchainEpochLogs(ctx) {
    try {
      // getevent
      await listener.getEventEpoch()
      console.log("getBlockchainStakeLogs finish")
      const ret = "{\"message\":\"OK\",\"result\":\"getBlockchainStakeLogs finish\"}"
      ctx.body = ret
    } catch(err) {
      console.log('getBlockchainStakeLogs err is ->', err)
      let errRet = "{\"code\":200,\"status\":\"Fail\",\"result\":\"" + err.toString() + "\"}"
      ctx.body = errRet
    }
  }

  async getBlockchainPandaLogs(ctx) {
    try {
      // getevent
      await listener.getEventPanda()
      console.log("getBlockchainStakeLogs finish")
      const ret = "{\"message\":\"OK\",\"result\":\"getBlockchainStakeLogs finish\"}"
      ctx.body = ret
    } catch(err) {
      console.log('getBlockchainStakeLogs err is ->', err)
      let errRet = "{\"code\":200,\"status\":\"Fail\",\"result\":\"" + err.toString() + "\"}"
      ctx.body = errRet
    }
  }
}

module.exports = new BlockchainController()



