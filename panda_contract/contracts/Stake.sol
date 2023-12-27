// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./libraries/AutomationCompatibleInterface.sol";

contract Stake is AccessControl, AutomationCompatibleInterface {
    event StakeEvent(address who, uint amount, uint when, uint256 epoch);
    event ActivateEvent(uint when);
    event NewEpoch(uint256 epoch, uint256 startTime, uint256 endTime);

    modifier onlyAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Restricted to admin role"
        );
        _;
    }

    modifier onlyActivated() {
        require(isActivate, "Have not activate.");
        _;
    }

    modifier onlyNotFinished() {
        require(!isFinished, "Have finished.");
        _;
    }

    uint256 public startTime;
    uint256 public epochInternal;
    uint256 public curEpoch;
    uint256 public curEndTime;
    uint256 public minStake;

    bool public isActivate;
    bool public isFinished;

    uint256 baseFeed;

    struct StakeInfo {
        uint256 totalStakeAmount;
        address[] stakerList;
    }

    mapping(uint256 => StakeInfo) public epochStakeInfo;
    mapping(uint256 => mapping(address => uint256)) public epochStakerAmount;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        baseFeed = 1 * 10 ** 18; // 1eth / 1matic
    }

    function getEpochStakeInfo(
        uint256 epoch
    ) public view returns (StakeInfo memory) {
        return epochStakeInfo[epoch];
    }

    function setMinStake(uint256 _minStake) public onlyAdmin {
        minStake = _minStake;
    }

    function setEpochInternal(uint256 _epochInternal) public onlyAdmin {
        epochInternal = _epochInternal;
    }

    function activate() public {
        require(!isActivate, "Have been activated.");
        startTime = block.timestamp;
        curEndTime = startTime + epochInternal;
        curEpoch = 1;
        isActivate = true;
        emit ActivateEvent(startTime);
        emit NewEpoch(curEpoch, startTime, curEndTime);
    }

    function _processFinished() internal virtual {}

    // TODO: how to calculate feedprice
    function feedAmount() public view returns (uint256) {
        return baseFeed;
    }

    function setBaseFeed(uint256 _baseFeed) public onlyAdmin {
        baseFeed = _baseFeed;
    }

    function _nextEpoch() internal onlyActivated onlyNotFinished {
        // check whether last epoch have feed enough fee
        if (epochStakeInfo[curEpoch].totalStakeAmount < feedAmount()) {
            // if finished, do something...
            isFinished = true;
            _processFinished();
        }

        _beforeNextEpoch();
        // TODO: how to calculate next epoch endtime
        // 1. curEndTime += epochInternal;
        // 2. curEndTime = block.timestamp + epochInternal;
        curEndTime = block.timestamp + epochInternal;

        curEpoch++;

        emit NewEpoch(curEpoch, block.timestamp, curEndTime);
    }

    function _beforeNextEpoch() internal virtual {}

    function _stake(uint256 epoch) internal onlyActivated onlyNotFinished {
        // require epoch not expired
        require(curEndTime >= block.timestamp, "Epoch is expired");

        epochStakeInfo[epoch].totalStakeAmount += msg.value;

        if (epochStakerAmount[epoch][msg.sender] != 0) {
            epochStakerAmount[epoch][msg.sender] += msg.value;
        } else {
            // first stake in this epoch
            epochStakerAmount[epoch][msg.sender] = msg.value;
            epochStakeInfo[epoch].stakerList.push(msg.sender);
        }

        emit StakeEvent(msg.sender, msg.value, block.timestamp, curEpoch);
    }

    function checkUpkeep(
        bytes calldata
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        upkeepNeeded = block.timestamp > curEndTime;
        performData = "";
    }

    function performUpkeep(bytes calldata) external override {
        require(block.timestamp > curEndTime, "Can't performUpkeep");
        _nextEpoch();
    }
}
