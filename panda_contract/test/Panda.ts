import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Panda", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployPandaFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Panda = await ethers.getContractFactory("Panda");
    const panda = await Panda.deploy("panda", "P");

    return { panda, owner, otherAccount };
  }

  async function deployTicketFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Ticket = await ethers.getContractFactory("Ticket");
    const ticket = await Ticket.deploy("Ticket", "T");

    return { ticket, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      let DAY = 1000 * 60 * 60 * 24;
      const { ticket, owner, otherAccount } = await loadFixture(
        deployTicketFixture
      );
      const { panda } = await loadFixture(deployPandaFixture);

      const ticketAddr = await ticket.getAddress();

      // if owner have no ticket can't stake
      await panda.setTicketContract(ticketAddr);
      await panda.setEpochInternal(1000);
      await panda.setProfit(1);

      expect(await panda.isActivate()).false;
      await panda.activate();
      expect(await panda.isActivate()).true;

      await expect(panda.stake({ value: 100000 })).to.be.revertedWith(
        "Account not have Panda Ticket"
      );

      await ticket.mint(1);
      await ticket.mint(1);
      await ticket.connect(otherAccount).mint(1);

      await ticket.transferFrom(owner.address, otherAccount.address, 0);

      await panda.stake({ value: 100000 });
      // Time travelling to the future!
      await time.increase(2000);
      // const initBalance = await ethers.provider.getBalance(owner.address);
      const initBalance = await panda.balanceOf(owner.address);

      expect(await panda.curEpoch()).equal(1);
      await panda.performUpkeep("0x");
      expect(await panda.curEpoch()).equal(2);
      const afterBalance = await panda.balanceOf(owner.address);
      expect(afterBalance > initBalance).true;

      console.log(await ticket.owners());

      await ticket.mint(1);
      await ticket.mint(1);
      await ticket.mint(1);

      // await mintTicket.wait(2);
    });
    it("Should send all balance to owner", async function () {
      let DAY = 1000 * 60 * 60 * 24;
      const { ticket, owner, otherAccount } = await loadFixture(
        deployTicketFixture
      );
      const { panda } = await loadFixture(deployPandaFixture);

      const ticketAddr = await ticket.getAddress();

      // if owner have no ticket can't stake
      await panda.setTicketContract(ticketAddr);
      await panda.setEpochInternal(1000);
      await panda.setReceiver(otherAccount.address);
      await panda.setProfit(1);

      expect(await panda.isActivate()).false;
      await panda.activate();
      expect(await panda.isActivate()).true;

      await expect(panda.stake({ value: 100000 })).to.be.revertedWith(
        "Account not have Panda Ticket"
      );

      await ticket.mint(1);

      await panda.stake({ value: 10 });
      // Time travelling to the future!
      await time.increase(2000);

      const initBalance = await ethers.provider.getBalance(
        otherAccount.address
      );

      await panda.performUpkeep("0x");
      const curBalance = await ethers.provider.getBalance(otherAccount.address);

      expect(curBalance > initBalance).true;
      expect(await panda.isFinished()).true;
    });
  });
});
