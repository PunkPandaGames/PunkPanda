import { ethers } from "hardhat";
const WAIT_BLOCKS = 20;

async function transfer() {
  const [deployer] = await ethers.getSigners();

  console.log("Interact contracts with the account:", deployer.address);

  console.log(
    "Account balance:",
    (await ethers.provider.getBalance(deployer.address)).toString()
  );

  const panda = "0x0b02b307b4b2e89bc7Dc82092621F97Ae7E44893";

  const Panda = await ethers.getContractFactory("Panda");
  const tbag = Panda.attach(panda);

  // (await tbag.setProfit(1000000000000000000n)).wait(WAIT_BLOCKS);
  // // activate
  // (await tbag.activate({ gasLimit: "0x1000000" })).wait(WAIT_BLOCKS);

  (await tbag.setBaseFeed(100000000000000000n)).wait(WAIT_BLOCKS); // 0.1 eth
  (await tbag.setMinStake(10000000000000000n)).wait(WAIT_BLOCKS); //0.01 eth
  (await tbag.setBaseFeed(1800n)).wait(WAIT_BLOCKS);
  (await tbag.setBaseFeed(1800n)).wait(WAIT_BLOCKS);
}

transfer();
