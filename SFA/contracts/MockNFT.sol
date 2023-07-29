pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockNFT is ERC721 {

    constructor(string memory _name, string memory _symbol, uint256 _amount) ERC721(_name, _symbol) {
        uint256 i; 
        for(i; i < _amount; ++i) {
            _mint(msg.sender, i);
        }
    }

}