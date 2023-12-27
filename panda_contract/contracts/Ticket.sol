// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ITicket.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Ticket is ERC721Enumerable, ERC721Holder, ITicket, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address public receiver;
    mapping(address => uint) _limit;
    uint256 public limitPerUser;

    modifier onlyAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Restricted to admin role"
        );
        _;
    }

    uint256 public TOTAL_SUPPLY = 1000;
    uint256 public mintFee;

    string public baseURI;

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC721(name_, symbol_) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        receiver = msg.sender;
    }

    function setReceiver(address _receiver) public onlyAdmin {
        receiver = _receiver;
    }

    function setBaseURI(string memory uri) public {
        baseURI = uri;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    // TODO: calculate mint price
    function getMintFee() public view returns (uint256) {
        return mintFee;
    }

    function setMintFee(uint256 _mintFee) public onlyAdmin {
        mintFee = _mintFee;
    }

    function setLimitPerUser(uint256 limit) public onlyAdmin {
        limitPerUser = limit;
    }

    function mint(uint256 amount) public payable {
        require(amount <= limitPerUser, "Only mint limit tickets at a time");
        uint256 _price = getMintFee();
        require(msg.value >= _price * amount, "Not enough fee");
        for (uint i = 0; i < amount; i++) {
            _mint();
        }
    }

    function _mint() internal {
        require(_limit[msg.sender] < limitPerUser, "Limit tickets per account");
        // TODO: mint limit
        uint256 newRecordId = _tokenIds.current();
        require(newRecordId < TOTAL_SUPPLY, "TOTAL_SUPPLY overflow.");
        _safeMint(msg.sender, newRecordId);
        // TODO: set tokenURI
        // domains[name] = msg.sender;
        _tokenIds.increment();
        _limit[msg.sender]++;
    }

    function owners() external view override returns (address[] memory) {
        uint256 currentSupply = totalSupply();
        address[] memory list = new address[](currentSupply);
        for (uint i = 0; i < currentSupply; i++) {
            address user = ownerOf(tokenByIndex(i));
            list[i] = user;
        }
        return list;
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return
            interfaceId == type(AccessControl).interfaceId ||
            interfaceId == type(ERC721Enumerable).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function withdraw() public onlyAdmin {
        payable(receiver).transfer(address(this).balance);
    }
}
