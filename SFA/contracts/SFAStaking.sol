// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SFAStaking is IERC721Receiver, Ownable, ReentrancyGuard {
    
    struct StakingData {
        uint256 tokenId;
        uint256 timestamp;
    }

    uint256 public immutable maxSolarPass = 5;
    uint256 public immutable maxSolarHead = 25;
    address public solarPass;
    address public solarHead;
    address public sfaToken;
    uint32 public payoutPeriod;
    mapping(address => uint256) public solarPassStaked;
    mapping(address => uint256) public solarHeadStaked;
    mapping(address => StakingData[5]) public solarPassStakedData;
    mapping(address => StakingData[25]) public solarHeadStakedData;

    constructor(
        address _solarPass,
        address _solarHead,
        address _sfaToken,
        uint32 _payoutPeriod
    ) {
        solarPass = _solarPass;
        solarHead = _solarHead;
        sfaToken = _sfaToken;
        payoutPeriod = _payoutPeriod;
    }


    /**
     * @notice views the staking state of a user
     * @param _user address of user whose state gets returned
     * @return uint256 amount of solar passes staked
     * @return uint256 amount of solar heads staked
     */
    function getStakedAmounts(address _user) external view returns(uint256, uint256) {
        uint256 userSolarPassesStaked = solarPassStaked[_user];
        uint256 userSolarHeadsStaked = solarHeadStaked[_user];
        return (userSolarPassesStaked, userSolarHeadsStaked);
    }


    /**
     * @notice stakes one solar head for msg.sender
     * @param _tokenId tokenId of solar head to be staked
     */
    function stakeSolarHead(uint256 _tokenId) external {
        uint256 amountStaked = solarHeadStaked[msg.sender];
        require(amountStaked + 1 <= maxSolarHead, "SFA Staking: staked amount exceeds limit");
        IERC721(solarHead).safeTransferFrom(msg.sender, address(this), _tokenId);
        solarHeadStaked[msg.sender] += 1;
        solarHeadStakedData[msg.sender][amountStaked] = StakingData(_tokenId, block.timestamp);
    }

    /**
     * @notice stakes multiple solar heads at one time for msg.sender
     * @param _amount the amount of solar heads to stake
     * @param _tokenIds the tokenIds of the solar heads being staked
     */
    function batchStakeSolarHead(uint256 _amount, uint256[] calldata _tokenIds) external {
        uint256 amountStaked = solarHeadStaked[msg.sender];
        require(amountStaked + _amount <= maxSolarHead, "SFA Staking: staked amount exceeds limit");
        
        address _solarHead = solarHead;

        uint256 i = 0;
        while(i < _amount) {
            IERC721(_solarHead).safeTransferFrom(msg.sender, address(this), _tokenIds[i]);
            solarHeadStaked[msg.sender] += 1;
            solarHeadStakedData[msg.sender][amountStaked + i] = StakingData(_tokenIds[i], block.timestamp);
            unchecked {
                ++i;
            }
        }
    }


    /**
     * @notice stakes one solar pass for msg.sender
     * @param _tokenId tokenId of solar pass to be staked
     */
    function stakeSolarPass(uint256 _tokenId) external {
        uint256 amountStaked = solarPassStaked[msg.sender];
        require(amountStaked + 1 <= maxSolarPass, "SFA Staking: staked amount exceeds limit");
        IERC721(solarPass).safeTransferFrom(msg.sender, address(this), _tokenId);
        solarPassStaked[msg.sender] += 1;
        solarPassStakedData[msg.sender][amountStaked] = StakingData(_tokenId, block.timestamp);
    }

     /**
     * @notice stakes multiple solar passes at one time for msg.sender
     * @param _amount the amount of solar passes to stake
     * @param _tokenIds the tokenIds of the solar passes being staked
     */
    function batchStakeSolarPass(uint256 _amount, uint256[] calldata _tokenIds) external {
        uint256 amountStaked = solarPassStaked[msg.sender];
        require(amountStaked + _amount <= maxSolarPass, "SFA Staking: staked amount exceeds limit");
        
        address _solarPass = solarPass;

        uint256 i = 0;
        while(i < _amount) {
            IERC721(_solarPass).safeTransferFrom(msg.sender, address(this), _tokenIds[i]);
            solarPassStaked[msg.sender] += 1;
            solarPassStakedData[msg.sender][amountStaked + i] = StakingData(_tokenIds[i], block.timestamp);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice allows msg.sender to claim SFA Token rewards, 
     * without having to withdraw their stakes NFTs
     */
    function claimRewards() external nonReentrant {
        uint256 solarHeadsStaked = solarHeadStaked[msg.sender];
        uint256 solarPassesStaked = solarPassStaked[msg.sender];

        uint256 tokensEarned;
        uint256 currTime = block.timestamp;
        uint32 _payoutPeriod = payoutPeriod;
        uint256 stakedTime;
        uint256 duration;

        uint256 i;
        while(i < solarHeadsStaked) {
            stakedTime = solarHeadStakedData[msg.sender][i].timestamp;
            duration = currTime - stakedTime;
            tokensEarned += (duration / _payoutPeriod) * 1 ether;
            solarHeadStakedData[msg.sender][i].timestamp = block.timestamp;
            unchecked {
                ++i;
            }
        }

        i = 0;
        while(i < solarPassesStaked) {
            stakedTime = solarPassStakedData[msg.sender][i].timestamp;
            duration = currTime - stakedTime;
            tokensEarned += (duration / _payoutPeriod) * 10 ether;
            solarPassStakedData[msg.sender][i].timestamp = block.timestamp;
            unchecked {
                ++i;
            }
        }

        IERC20(sfaToken).transfer(msg.sender, tokensEarned);
    }


     /**
     * @notice withdraws users staked NFTs. Additonally, claims
     * all SFA Token rewards for the user.
     */
    function withdraw() external nonReentrant {

        address _solarHead = solarHead;
        address _solarPass = solarPass;

        uint256 solarHeadsStaked = solarHeadStaked[msg.sender];
        uint256 solarPassesStaked = solarPassStaked[msg.sender];

        solarHeadStaked[msg.sender] = 0;
        solarPassStaked[msg.sender] = 0;

        uint256 tokensEarned;
        uint256 currTime = block.timestamp;
        uint32 _payoutPeriod = payoutPeriod;
        uint256 stakedTime;
        uint256 duration;

        uint256 i = 0;

        while(i < solarHeadsStaked) {
            stakedTime = solarHeadStakedData[msg.sender][i].timestamp;
            duration = currTime - stakedTime;
            tokensEarned += (duration / _payoutPeriod) * 1 ether;
            solarHeadStakedData[msg.sender][i].timestamp = 0;
            IERC721(_solarHead).safeTransferFrom(address(this), msg.sender, solarHeadStakedData[msg.sender][i].tokenId);
            unchecked {
                ++i;
            }
        }

        i = 0;
        while(i < solarPassesStaked) {
            stakedTime = solarPassStakedData[msg.sender][i].timestamp;
            duration = currTime - stakedTime;
            tokensEarned += (duration / _payoutPeriod) * 10 ether;
            solarPassStakedData[msg.sender][i].timestamp = 0;
            IERC721(_solarPass).safeTransferFrom(address(this), msg.sender, solarPassStakedData[msg.sender][i].tokenId);
            unchecked {
                ++i;
            }
        }

        IERC20(sfaToken).transfer(msg.sender, tokensEarned);
    }

     /**
     * @notice withdraws users staked SolarPass. Additonally, claims
     * all SFA Token rewards for the user.
     */
    function withdrawSolarPass() external nonReentrant {

        address _solarPass = solarPass;

        uint256 solarPassesStaked = solarPassStaked[msg.sender];

        solarPassStaked[msg.sender] = 0;

        uint256 tokensEarned;
        uint256 currTime = block.timestamp;
        uint32 _payoutPeriod = payoutPeriod;
        uint256 stakedTime;
        uint256 duration;

        uint256 i = 0;
        while(i < solarPassesStaked) {
            stakedTime = solarPassStakedData[msg.sender][i].timestamp;
            duration = currTime - stakedTime;
            tokensEarned += (duration / _payoutPeriod) * 10 ether;
            solarPassStakedData[msg.sender][i].timestamp = 0;
            IERC721(_solarPass).safeTransferFrom(address(this), msg.sender, solarPassStakedData[msg.sender][i].tokenId);
            unchecked {
                ++i;
            }
        }
        IERC20(sfaToken).transfer(msg.sender, tokensEarned);
    }

     /**
     * @notice withdraws users staked SolarPass. Additonally, claims
     * all SFA Token rewards for the user.
     */
    function withdrawSolarHead() external nonReentrant {

        address _solarHead = solarHead;

        uint256 solarHeadesStaked = solarHeadStaked[msg.sender];

        solarHeadStaked[msg.sender] = 0;

        uint256 tokensEarned;
        uint256 currTime = block.timestamp;
        uint32 _payoutPeriod = payoutPeriod;
        uint256 stakedTime;
        uint256 duration;

        uint256 i = 0;
        while(i < solarHeadesStaked) {
            stakedTime = solarHeadStakedData[msg.sender][i].timestamp;
            duration = currTime - stakedTime;
            tokensEarned += (duration / _payoutPeriod) * 10 ether;
            solarHeadStakedData[msg.sender][i].timestamp = 0;
            IERC721(_solarHead).safeTransferFrom(address(this), msg.sender, solarHeadStakedData[msg.sender][i].tokenId);
            unchecked {
                ++i;
            }
        }
        IERC20(sfaToken).transfer(msg.sender, tokensEarned);
    }

     /**
     * @notice withdraws users staked SolarPass. Additonally, claims
     * all SFA Token rewards for the user.
     */
    function emergencyWithdrawSolarPass() external {

        address _solarPass = solarPass;

        uint256 solarPassesStaked = solarPassStaked[msg.sender];

        solarPassStaked[msg.sender] = 0;

        uint256 i = 0;
        while(i < solarPassesStaked) {
            solarPassStakedData[msg.sender][i].timestamp = 0;
            IERC721(_solarPass).safeTransferFrom(address(this), msg.sender, solarPassStakedData[msg.sender][i].tokenId);
        }
    }

     /**
     * @notice withdraws users staked SolarPass. Additonally, claims
     * all SFA Token rewards for the user.
     */
    function emergencyWithdrawSolarHead() external {

        address _solarHead = solarHead;

        uint256 solarHeadesStaked = solarHeadStaked[msg.sender];

        solarHeadStaked[msg.sender] = 0;

        uint256 i = 0;
        while(i < solarHeadesStaked) {
            solarHeadStakedData[msg.sender][i].timestamp = 0;
            IERC721(_solarHead).safeTransferFrom(address(this), msg.sender, solarHeadStakedData[msg.sender][i].tokenId);
        }
    }

    function changePayoutPeriod(uint32 _newPeriod) external onlyOwner {
        payoutPeriod = _newPeriod;
    }

     /**
     * @notice required to allow this contract to recieve NFTs
     * in accordance of ERC721 token standard 
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

}