const db = require('../db/index')
const ethers = require('ethers')

const TESTNET_URL = 'https://tomo.blockpi.network/v1/rpc/public';
// const TESTNET_URL = 'https://polygon-mumbai.gateway.tenderly.co/6mNuAdXAWkWCeFaPHLWukf';

const useListener = async () => {
    const provider = new ethers.JsonRpcProvider(TESTNET_URL);
    //const transferCA = "0xF745e14AB45e827AC1e034e316252DB20A2Af8fB"
    const transferCA = "0x34aea8554E1A288769FA498f759a17B3ceD28AaD"
    const transferABI = [ "event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId)" ];
    //const pandaCA = "0xc0deE4a732eA506eBdFe4AaBbf8f80bF3568F32F"
    const pandaCA = "0x482270069fF98a0dF528955B651494759b3B2F8C"
    const feedABI = [ "event StakeEvent(address who, uint amount, uint when, uint epoch)" ];
    const epochABI = [ "event NewEpoch(uint256 epoch, uint256 startTime, uint256 endTime)" ];
    const pandaABI = [
        "event StakeEvent(address who, uint amount, uint when, uint epoch)",
        "event NewEpoch(uint256 epoch, uint256 startTime, uint256 endTime)",
        "event Transfer(address indexed from, address indexed to, uint value)"
    ]
    
    /* mint nft listener */
    try {
        const transferContractHandle = new ethers.Contract(transferCA, transferABI, provider);
        transferContractHandle.on('Transfer', async (_from, _to, _tokenId)=>{
            console.log(`TransferListener:${_from} -> ${_to} ${_tokenId}`)
            var timestamp = Date.now()/1000;
            const transferInsert = "insert into tokenmint (Owner, TokenID, DateTime, MintPrice) values ('" + _to.toString() + "','" + _tokenId.toString() + "','" + timestamp.toString() + "','0')";
            await db(transferInsert);
            console.log("insert mint data successful");
        })
    } catch(err) {
        console.log('transfer listener err is ->', err );
    }

    /* feed listener */
    try {
        const feedContractHandle = new ethers.Contract(pandaCA, feedABI, provider);
        feedContractHandle.on('StakeEvent', async (who, amount, when, epoch)=>{
            console.log(`FeedListener:${who} -> ${amount} ${when} ${epoch}`)
            const sqlInsert = "insert into pandafeed (FeedAddress, FeedValue, FeedTime, FeedEpoch) values ('" + who.toString() + "','" + amount.toString() + "','" + when.toString() + "','" + epoch.toString() + "')";
            await db(sqlInsert);
            console.log("insert feed data successful");
        })
    } catch(err) {
        console.log('feed listener err is ->', err );
    }

    /* epoch listener */
    try {
        const epochContractHandle = new ethers.Contract(pandaCA, epochABI, provider);
        epochContractHandle.on('NewEpoch', async (epoch, startTime, endTime)=>{
            console.log(`EpochListener:${startTime} -> ${endTime} ${epoch}`)
            const epochInsert = "insert into epochtime (RoundNumber, EpochStart, EpochEnd) values ('" + epoch.toString() + "','" + startTime.toString() + "','" + endTime.toString() + "')";
            await db(epochInsert);
            console.log("insert epoch data successful");
        })
    } catch(err) {
        console.log('epoch listener err is ->', err );
    }

    /* drop token listener */
    try {
        let DropCoinBase = "0xc0deE4a732eA506eBdFe4AaBbf8f80bF3568F32F"
        const dropContractHandle = new ethers.Contract(pandaCA, pandaABI, provider);
        let filterTokenDrop = dropContractHandle.filters.Transfer(DropCoinBase, null);
        dropContractHandle.on(filterTokenDrop,  async (from, to, value)=>{
            console.log(`DropListener:${from} -> ${to} ${value}`)
            var timestamp = Date.now()/1000;
            const DropInsert = "insert into droptoken (DropAddress, DropBalance, DropTime) values ('" + to.toString() + "','" + value.toString() + "','" + timestamp.toString() + "')";
            await db(DropInsert);
            console.log("insert drop data successful");
        })
    } catch(err) {
        console.log('drop listener err is ->', err );
    }
}


module.exports = useListener