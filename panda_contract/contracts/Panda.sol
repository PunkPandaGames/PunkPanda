// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./Stake.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./ITicket.sol";

contract Panda is ERC20, Stake {
    address public ticketContract;
    address public receiver;
    uint256 public profit;

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) Stake() {
        receiver = msg.sender;
    }

    function setTicketContract(address _ticketContract) public onlyAdmin {
        ticketContract = _ticketContract;
    }

    function setReceiver(address _receiver) public onlyAdmin {
        receiver = _receiver;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(AccessControl) returns (bool) {
        return
            interfaceId == type(AccessControl).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function stake() public payable {
        // require msg.sender can stake
        require(
            IERC721(ticketContract).balanceOf(msg.sender) > 0,
            "Account not have Panda Ticket"
        );
        // require min stake
        require(msg.value > minStake, "Not enough stake.");
        _stake(curEpoch);
    }

    // TODO: how to calculate amount send to users.
    function _calculateAmount() internal view returns (uint256) {
        return profit;
    }

    function setProfit(uint256 _profit) public onlyAdmin {
        profit = _profit;
    }

    function _beforeNextEpoch() internal override {
        // after open next epoch, mint token for all owners
        address[] memory owners = ITicket(ticketContract).owners();
        uint256 size = owners.length;
        for (uint256 i = 0; i < size; i++) {
            address owner = owners[i];
            _mint(owner, _calculateAmount());
        }
    }

    function _processFinished() internal override {
        // if dead
        payable(receiver).transfer(address(this).balance);
    }
}
