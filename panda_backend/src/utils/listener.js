const db = require('../db/index')
const ethers = require('ethers')
const Web3 = require('web3');

const TESTNET_URL = 'https://tomo.blockpi.network/v1/rpc/public';
// const TESTNET_URL = 'https://polygon-mumbai.gateway.tenderly.co/6mNuAdXAWkWCeFaPHLWukf';

class ListenerUtils {
    async startTransferListener () {
        const provider = new ethers.JsonRpcProvider(TESTNET_URL);
        // const contractAddress = "0xB6120De62561D702087142DE405EEB02c18873Bc";
        const contractAddress = "0xc6296068F49eA77ADb3823E960763e3c4a93D4dE"
        const abi = [ "event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId)" ];
        
        try {
            const contractHandle = new ethers.Contract(contractAddress, abi, provider);
            contractHandle.on('Transfer', async (_from, _to, _tokenId)=>{
                console.log(`TransferListener:${_from} -> ${_to} ${_tokenId}`)
                /* insert to db */
                var timestamp = Date.now()/1000;
                const sqlInsert = "insert into tokenmint (Owner, TokenID, DateTime, MintPrice) values ('" + _to.toString() + "','" + _tokenId.toString() + "','" + timestamp.toString() + "','0')";
                await db(sqlInsert);
                console.log("insert mint data successful");
            })
        } catch(err) {
            console.log('err is ->', err );
        }
    }

    async startFeedListener () {
        const provider = new ethers.JsonRpcProvider(TESTNET_URL);
        // const contractAddress = "0x5C4cDd0160c0CB4C606365dD98783064335A9ce0";
        const contractAddress = "0x3d051fCD5e5809b176212Db18BDfD97e1840a4A0"
        const abi = [ "event StakeEvent(address who, uint amount, uint when, uint epoch)" ];
        
        try {
            const contractHandle = new ethers.Contract(contractAddress, abi, provider);
            contractHandle.on('StakeEvent', async (who, amount, when, epoch)=>{
                console.log(`FeedListener:${who} -> ${amount} ${when} ${epoch}`)
                const sqlInsert = "insert into pandafeed (FeedAddress, FeedValue, FeedTime, FeedEpoch) values ('" + who.toString() + "','" + amount.toString() + "','" + when.toString() + "','" + epoch.toString() + "')";
                await db(sqlInsert);
                console.log("insert feed data successful");
            })
        } catch(err) {
            console.log('err is ->', err );
        }
    }

    async startEpochListener () {
        const provider = new ethers.JsonRpcProvider(TESTNET_URL);
        // const contractAddress = "0x5C4cDd0160c0CB4C606365dD98783064335A9ce0";
        const contractAddress = "0x3d051fCD5e5809b176212Db18BDfD97e1840a4A0"
        const abi = [ "event NewEpoch(uint256 epoch, uint256 startTime, uint256 endTime)" ];
        
        try{
            const contractHandle = new ethers.Contract(contractAddress, abi, provider);
            contractHandle.on('NewEpoch(', async (epoch, startTime, endTime)=>{
                console.log(`EpochListener:${startTime} -> ${endTime} ${epoch}`)
                const sqlInsert = "insert into epochtime (RoundNumber, EpochStart, EpochEnd) values ('" + epoch.toString() + "','" + startTime.toString() + "','" + endTime.toString() + "')";
                await db(sqlInsert);
                console.log("insert epoch data successful");
            })
        } catch(err) {
            console.log('err is ->', err );
        }
    }

    async stopListener (FunctionName) {
        const provider = new ethers.JsonRpcProvider(ALCHEMY_MAINNET_URL);
        const contractAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
        const abi = [ "event Transfer(address indexed from, address indexed to, uint value)" ];
        
        const contractHandle = new ethers.Contract(contractAddress, abi, provider);
        contractHandle.off(FunctionName, ()=>{
            console.log('remove listener successful')
        })
    }

    async getEventTicket() {
        var web3 = new Web3(TESTNET_URL);
        let transferCA = "0x34aea8554E1A288769FA498f759a17B3ceD28AaD"
        let transferABI = [
            {
                "anonymous": false,
                "inputs": [
                  {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                  },
                  {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                  },
                  {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                  }
                ],
                "name": "Transfer",
                "type": "event"
            }
        ];
        
        // const code = await web3.eth.getCode("0x1BaF1035d5b6B3DaBc1AB89a34ca1343da1F296e");
        // console.log('code is ->', code);
        
        let contract = new web3.eth.Contract(transferABI, transferCA);
        await contract.getPastEvents('Transfer',{
            fromBlock: 0,
            toBlock: 'latest'
        },async (err, events) => {
            console.log(events.length);
            for(let i=0; i<events.length; i++) {
                let logInfo = events[i]
                //console.log(logInfo)
                let blockinfo = await web3.eth.getBlock(logInfo["blockNumber"])
                const sqlCheck = "select * from tokenmint where Owner='" + logInfo["returnValues"]["to"] + "' and TokenID='" + logInfo["returnValues"]["tokenId"] + "' and TxHash='" + logInfo["transactionHash"] + "'"
                //console.log('checking sql is ->', sqlCheck);
                const checkResults = await db(sqlCheck);
                //console.log('checkResults length is ->', checkResults.length);
                if(checkResults.length > 0) {
                    console.log("data is exist, tokenid is ->", logInfo["returnValues"]["tokenId"])
                } else {
                    const sqlInsert = "insert into tokenmint (Owner, TokenID, DateTime, MintPrice, TxHash) values ('" + logInfo["returnValues"]["to"] + "','" + logInfo["returnValues"]["tokenId"] + "','" + blockinfo["timestamp"] + "','0.1','" + logInfo["transactionHash"] + "')";
                    console.log('insert sql is ->', sqlInsert);
                    await db(sqlInsert);
                    console.log("insert mint data successful,tokenid is ->", logInfo["returnValues"]["tokenId"]);
                }
            }
        });
    }

    async getEventStake() {
        var web3 = new Web3(TESTNET_URL);
        let pandaCA = "0x482270069fF98a0dF528955B651494759b3B2F8C"
        let pandaABI = [
            {
                "anonymous": false,
                "inputs": [
                  {
                    "indexed": false,
                    "internalType": "address",
                    "name": "who",
                    "type": "address"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "when",
                    "type": "uint256"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "epoch",
                    "type": "uint256"
                  }
                ],
                "name": "StakeEvent",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "epoch",
                    "type": "uint256"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "startTime",
                    "type": "uint256"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "endTime",
                    "type": "uint256"
                  }
                ],
                "name": "NewEpoch",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                  {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                  },
                  {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                  }
                ],
                "name": "Transfer",
                "type": "event"
            }
        ]

        let contract = new web3.eth.Contract(pandaABI, pandaCA);
        await contract.getPastEvents('StakeEvent',{
            fromBlock: 0,
            toBlock: 'latest'
        },async (err, events) => {
            console.log(events.length);
            for(let i=0; i<events.length; i++) {
                let logInfo = events[i]
                //console.log(logInfo);
                const sqlCheck = "select * from pandafeed where TxHash='" + logInfo["transactionHash"] + "' and FeedAddress='" + logInfo["returnValues"]["who"] + "' and FeedValue='" + logInfo["returnValues"]["amount"] + "' and FeedTime='" + logInfo["returnValues"]["when"] + "' and FeedEpoch='" + logInfo["returnValues"]["epoch"] + "'"
                const checkResults = await db(sqlCheck);
                if(checkResults.length > 0) {
                    console.log(`data is exist, FeedAddress is -> ${logInfo["returnValues"]["who"]}, FeedValue is -> ${logInfo["returnValues"]["amount"]}, FeedTime is -> ${logInfo["returnValues"]["when"]}, FeedEpoch is -> ${logInfo["returnValues"]["epoch"]}`)
                } else {
                    const sqlInsert = "insert into pandafeed (FeedAddress, FeedValue, FeedTime, FeedEpoch, TxHash) values ('" + logInfo["returnValues"]["who"] + "','" + logInfo["returnValues"]["amount"] + "','" + logInfo["returnValues"]["when"] + "','" + logInfo["returnValues"]["epoch"] + "','" + logInfo["transactionHash"] + "')";
                    await db(sqlInsert);
                    console.log(`insert feed data successful, FeedAddress is -> ${logInfo["returnValues"]["who"]}, FeedValue is -> ${logInfo["returnValues"]["amount"]}, FeedTime is -> ${logInfo["returnValues"]["when"]}, FeedEpoch is -> ${logInfo["returnValues"]["epoch"]}`);
                }
            }
        });
    }


    async getEventEpoch() {
        var web3 = new Web3(TESTNET_URL);
        let pandaCA = "0x482270069fF98a0dF528955B651494759b3B2F8C"
        let pandaABI = [
            {
                "anonymous": false,
                "inputs": [
                  {
                    "indexed": false,
                    "internalType": "address",
                    "name": "who",
                    "type": "address"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "when",
                    "type": "uint256"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "epoch",
                    "type": "uint256"
                  }
                ],
                "name": "StakeEvent",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "epoch",
                    "type": "uint256"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "startTime",
                    "type": "uint256"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "endTime",
                    "type": "uint256"
                  }
                ],
                "name": "NewEpoch",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                  {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                  },
                  {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                  }
                ],
                "name": "Transfer",
                "type": "event"
            }
        ]

        try{
            let contract = new web3.eth.Contract(pandaABI, pandaCA);
            await contract.getPastEvents('NewEpoch',{
                fromBlock: 0,
                toBlock: 'latest'
            },async (err, events) => {
                console.log(`contract message is ${events}`);
                
                if(events != undefined) {
                    console.log(events.length);
                    for(let i=0; i<events.length; i++) {
                        let logInfo = events[i]
        
                        const sqlCheck = "select * from epochtime where TxHash='" + logInfo["transactionHash"] + "'"
                        const checkResults = await db(sqlCheck);
                        if(checkResults.length > 0) {
                            console.log(`data is exist, Epoch is -> ${logInfo["returnValues"]["epoch"]}, StartTime is -> ${logInfo["returnValues"]["startTime"]}, StopTime is -> ${logInfo["returnValues"]["endTime"]}`)
                        } else {
                            const sqlInsert = "insert into epochtime (RoundNumber, EpochStart, EpochEnd, TxHash) values ('" + logInfo["returnValues"]["epoch"] + "','" + logInfo["returnValues"]["startTime"] + "','" + logInfo["returnValues"]["endTime"] + "','" + logInfo["transactionHash"] + "')";
                            await db(sqlInsert);
                            console.log(`insert epoch data successful, Epoch is -> ${logInfo["returnValues"]["epoch"]}, StartTime is -> ${logInfo["returnValues"]["startTime"]}, StopTime is -> ${logInfo["returnValues"]["endTime"]}`);
                        }
                    }
                } else {
                    console.log("events is undefined");
                }
            });
        } catch(error) {
            console.log(`getEventEpoch error! error message is -> ${error}`);
        }
    }


    async getEventPanda() {
        var web3 = new Web3(TESTNET_URL);
        let pandaCA = "0x482270069fF98a0dF528955B651494759b3B2F8C"
        let pandaABI = [
            {
                "anonymous": false,
                "inputs": [
                  {
                    "indexed": false,
                    "internalType": "address",
                    "name": "who",
                    "type": "address"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "when",
                    "type": "uint256"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "epoch",
                    "type": "uint256"
                  }
                ],
                "name": "StakeEvent",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "epoch",
                    "type": "uint256"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "startTime",
                    "type": "uint256"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "endTime",
                    "type": "uint256"
                  }
                ],
                "name": "NewEpoch",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                  {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                  },
                  {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                  }
                ],
                "name": "Transfer",
                "type": "event"
            }
        ]

        let contract = new web3.eth.Contract(pandaABI, pandaCA);
        await contract.getPastEvents('Transfer',{
            fromBlock: 0,
            toBlock: 'latest'
        },async (err, events) => {
            console.log(events.length);
            for(let i=0; i<events.length; i++) {
                let logInfo = events[i]
                const sqlCheck = "select * from droptoken where TxHash='" + logInfo["transactionHash"] + "' and DropAddress='" + logInfo["returnValues"]["to"] + "' and DropBalance='" + logInfo["returnValues"]["value"] + "'"
                const checkResults = await db(sqlCheck);
                if(checkResults.length > 0) {
                    console.log(`data is exist, droptoken is -> ${logInfo["returnValues"]["epoch"]}, StartTime is -> ${logInfo["returnValues"]["startTime"]}, StopTime is -> ${logInfo["returnValues"]["endTime"]}`)
                } else {
                    let blockinfo = await web3.eth.getBlock(logInfo["blockNumber"])
                    const sqlInsert = "insert into droptoken (DropAddress, DropBalance, DropTime, TxHash) values ('" + logInfo["returnValues"]["to"] + "','" + logInfo["returnValues"]["value"] + "','" + blockinfo["timestamp"] + "','" + logInfo["transactionHash"] + ")";
                    await db(sqlInsert);
                    console.log(`insert droptoken data successful, DropAddress is -> ${logInfo["returnValues"]["to"]}, DropBalance is -> ${logInfo["returnValues"]["value"]}`);
                }
            }
        });
    }
}

module.exports = new ListenerUtils()