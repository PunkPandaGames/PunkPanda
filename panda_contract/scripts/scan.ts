import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config();
const WAIT_BLOCKS = 10;

async function main() {
  // setInterval(scanUpKeep, 1000 * 60);
  setTimeout(async function run() {
    await scanUpKeep();
    setTimeout(run, 1000);
  }, 60000);
  // scanUpKeep();
}

async function scanUpKeep() {
  const panda = "0x3d051fCD5e5809b176212Db18BDfD97e1840a4A0";
  const Panda = await ethers.getContractFactory("Panda");
  const PandaContract = Panda.attach(panda);

  const { upkeepNeeded } = await PandaContract.checkUpkeep("0x");
  if (upkeepNeeded) {
    console.log("perform");
    (await PandaContract.performUpkeep("0x")).wait(WAIT_BLOCKS);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
