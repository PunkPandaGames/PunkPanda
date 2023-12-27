import { ethers } from "hardhat";

const WAIT_BLOCKS = 20;
const EPOCH_TIME = 0.5 * 60 * 60;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(
    `Deploying contracts with the account:${deployer.address} balance:${(
      await ethers.provider.getBalance(deployer.address)
    ).toString()}`
  );

  // deploy Ticket
  const ticket = await ethers.deployContract("Ticket", ["Ticket", "TK"], {
    gasLimit: "0x1000000",
  });
  await ticket.waitForDeployment();
  console.log(`Ticket was deployed to ${ticket.target}`);

  (await ticket.setLimitPerUser(5n, { gasLimit: "0x1000000" })).wait(
    WAIT_BLOCKS
  );
  console.log(`Ticket setLimitPerUser`);

  (await ticket.setMintFee(10000000000000000n, { gasLimit: "0x1000000" })).wait(
    WAIT_BLOCKS
  );
  console.log(`Ticket setLimitPerUser`);

  // deploy Panda
  const panda = await ethers.deployContract("Panda", ["Panda", "PD"], {
    gasLimit: "0x1000000",
  });
  await panda.waitForDeployment();
  console.log(`Pande was deployed to ${panda.target}`);

  // set Ticket
  (
    await panda.setTicketContract(ticket.target, { gasLimit: "0x1000000" })
  ).wait(WAIT_BLOCKS);

  console.log(`Pande set ticket`);
  // set EpochInternal
  (
    await panda.setBaseFeed(100000000000000000n, { gasLimit: "0x1000000" })
  ).wait(WAIT_BLOCKS);
  console.log(`Pande set setBaseFeed`);
  (await panda.setMinStake(10000000000000000n, { gasLimit: "0x1000000" })).wait(
    WAIT_BLOCKS
  );
  console.log(`Pande set setBaseFeed`);
  // set EpochInternal
  (await panda.setEpochInternal(EPOCH_TIME, { gasLimit: "0x1000000" })).wait(
    WAIT_BLOCKS
  );
  console.log(`Pande set epochInternal`);
  // set profit
  (await panda.setProfit(1000000000000000000n, { gasLimit: "0x1000000" })).wait(
    WAIT_BLOCKS
  );
  console.log(`Pande setProfit`);
  // activate
  (await panda.activate({ gasLimit: "0x1000000" })).wait(WAIT_BLOCKS);
  console.log(`Pande activate`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
