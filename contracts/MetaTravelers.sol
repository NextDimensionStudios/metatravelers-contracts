// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract MetaTravelers is ERC721Enumerable, ERC721Pausable, ERC721Burnable, VRFConsumerBase, Ownable {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    using Strings for uint256;

    uint256 public constant PRICE = .123 ether;
    uint256 public constant MAX_QUANTITY = 3;
    uint256 public constant MAX_SUPPLY = 7777;
    uint256 public constant MAX_RESERVE = 33;
    
    string public provenanceHash = "";
    uint256 public startingIndex;
    

    Counters.Counter private _tokenIdTracker;
    string private _baseTokenURI;

    bytes32 internal _keyHash;
    uint256 internal _fee;

    /**
     * @dev Initializes the contract with the name, symbol, and baseTokenURI,
     * and pauses the contract by default
     */
    constructor (
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address vrfCoordinator,
        address linkToken,
        bytes32 keyHash,
        uint256 fee
    )
    ERC721(name, symbol) 
    VRFConsumerBase(vrfCoordinator, linkToken)
    {
        _baseTokenURI = baseTokenURI;
        _keyHash = keyHash;
        _fee = fee;
        _pause();
    }

    event AssetsMinted(address owner, uint256 quantity);
    event RequestedRandomness(bytes32 requestId);
    event StartingIndexSet(bytes32 requestId, uint256 randomNumber);

    /**
     * @dev Update the base token URI for returning metadata
     */
    function setBaseTokenURI(string memory baseTokenURI) external onlyOwner {
        _baseTokenURI = baseTokenURI;
    }

    /**
     * @dev Creates a new token for `to`. Its token ID will be automatically
     * assigned (and available on the emitted {IERC721-Transfer} event), and the token
     * URI autogenerated based on the base URI passed at construction.
     *
     * See {ERC721-_mint}.
     */
    function mint(address to, uint256 quantity) external payable {
        require( totalSupply() + quantity <= MAX_SUPPLY, "Purchase exceeds max supply");
        require(quantity <= MAX_QUANTITY, "Order exceeds max quantity");
        require(msg.value >= PRICE * quantity, "Ether value sent is not correct");

        for(uint256 i=0; i<quantity; i++){
            _mint(to, _tokenIdTracker.current());
            _tokenIdTracker.increment();
        }
        emit AssetsMinted(to, quantity);
    }

    /**
     * @dev Reserve MetaTravelers
     */
    function reserveMetaTravelers() public onlyOwner {
        for(uint256 i=0; i<MAX_RESERVE; i++){
            _safeMint(_msgSender(), _tokenIdTracker.current());
            _tokenIdTracker.increment();
        }
        emit AssetsMinted(_msgSender(), MAX_RESERVE);
    }

    /**
     * @dev Set the provenanceHash used for verifying fair and random distribution
     */
    function setProvenanceHash(string memory newProvenanceHash) public onlyOwner {
        provenanceHash = newProvenanceHash;
    }

    /**
     * @dev Set the startingIndex using Chainlink VRF for provable on-chain randomness
     * See callback function 'fulfillRandomness'
     */
    function setStartingIndex() public {
        require(startingIndex == 0, "Starting index is already set");
        require(LINK.balanceOf(address(this)) >= _fee, "Not enough LINK - fill contract with faucet");
        bytes32 requestId = requestRandomness(_keyHash, _fee);
        emit RequestedRandomness(requestId);
    }

    /**
     * @dev Callback function used by VRF Coordinator.
     * Sets the startingIndex based on the random number generated by Chainlink VRF
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        startingIndex = randomness % MAX_SUPPLY;
        
        // Prevent default sequence
        if (startingIndex == 0) {
            startingIndex = startingIndex.add(1);
        }
        emit StartingIndexSet(requestId, randomness);
    }

    /**
     * @dev Used to withdraw funds from the contract
     */
    function withdraw() public onlyOwner() {
        uint256 balance = address(this).balance;
        payable(_msgSender()).transfer(balance);
    }
    
    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token.");
        return bytes(_baseTokenURI).length > 0 ? string(abi.encodePacked(_baseTokenURI, tokenId.toString())) : "";
    }

    /**
     * @dev Used to pause contract minting per ERC721Pausable
     */
    function pause() external onlyOwner() {
        _pause();
    }

    /**
     * @dev Used to unpause contract minting per ERC721Pausable
     */
    function unpause() external onlyOwner() {
        _unpause();
    }
    
    /**
     * @dev Required due to inheritance
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }     

    /**
     * @dev Required due to inheritance
     */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721, ERC721Enumerable, ERC721Pausable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }   
}