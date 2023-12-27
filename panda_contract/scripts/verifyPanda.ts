import { verify } from "./verify";

const TICKET_ADDRESS = "0xc6296068F49eA77ADb3823E960763e3c4a93D4dE";
const PANDA_ADDRESS = "0x3d051fCD5e5809b176212Db18BDfD97e1840a4A0";

async function main() {
  await verify(TICKET_ADDRESS, "contracts/Ticket.sol:Ticket", ["Ticket", "TK"]);
  await verify(PANDA_ADDRESS, "contracts/Panda.sol:Panda", ["Panda", "PD"]);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
