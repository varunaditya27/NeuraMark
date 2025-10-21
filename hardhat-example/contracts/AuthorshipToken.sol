// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AuthorshipToken
 * @dev Soulbound NFT for AI Content Authorship Proof
 * @notice Non-transferable ERC-721 tokens minted upon proof registration
 * 
 * Each token represents immutable proof of authorship for AI-generated content.
 * Tokens cannot be transferred, sold, or burned - they are permanently bound to the creator's wallet.
 */
contract AuthorshipToken is ERC721, Ownable {
    // Proof metadata structure
    struct ProofMetadata {
        string promptHash;      // SHA-256 hash of the prompt
        string outputHash;      // SHA-256 hash of the output
        string ipfsCID;         // IPFS CID for content storage
        string modelInfo;       // AI model information
        uint256 timestamp;      // Block timestamp when minted
        address creator;        // Original creator address
    }

    // Token ID counter
    uint256 private _nextTokenId = 1;

    // Base URI for metadata
    string private _baseTokenURI;

    // Mapping from token ID to proof metadata
    mapping(uint256 => ProofMetadata) public proofData;

    // Mapping from creator address to their token IDs
    mapping(address => uint256[]) private _creatorTokens;

    // Events
    event AuthorshipMinted(
        address indexed to,
        uint256 indexed tokenId,
        string ipfsCID,
        string modelInfo,
        uint256 timestamp
    );

    event BaseURIUpdated(string newBaseURI);

    /**
     * @dev Constructor
     * @param baseURI Base URI for token metadata
     */
    constructor(string memory baseURI) ERC721("NeuraMark Authorship Token", "NEURA") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Mint a new authorship token
     * @param to Address to mint the token to (proof creator)
     * @param promptHash SHA-256 hash of the prompt
     * @param outputHash SHA-256 hash of the output
     * @param ipfsCID IPFS CID for content storage
     * @param modelInfo AI model information
     * @return tokenId The ID of the newly minted token
     */
    function mintAuthorshipToken(
        address to,
        string memory promptHash,
        string memory outputHash,
        string memory ipfsCID,
        string memory modelInfo
    ) public returns (uint256) {
        // Validation
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(promptHash).length > 0, "Prompt hash cannot be empty");
        require(bytes(outputHash).length > 0, "Output hash cannot be empty");
        require(bytes(ipfsCID).length > 0, "IPFS CID cannot be empty");
        require(bytes(modelInfo).length > 0, "Model info cannot be empty");

        // Get current token ID and increment counter
        uint256 tokenId = _nextTokenId++;

        // Mint the token
        _safeMint(to, tokenId);

        // Store proof metadata
        proofData[tokenId] = ProofMetadata({
            promptHash: promptHash,
            outputHash: outputHash,
            ipfsCID: ipfsCID,
            modelInfo: modelInfo,
            timestamp: block.timestamp,
            creator: to
        });

        // Track creator's tokens
        _creatorTokens[to].push(tokenId);

        // Emit event
        emit AuthorshipMinted(to, tokenId, ipfsCID, modelInfo, block.timestamp);

        return tokenId;
    }

    /**
     * @dev Get all token IDs owned by a creator
     * @param creator Address of the creator
     * @return Array of token IDs
     */
    function getTokensByCreator(address creator) public view returns (uint256[] memory) {
        return _creatorTokens[creator];
    }

    /**
     * @dev Get the total number of tokens minted
     * @return Total supply of tokens
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1;
    }

    /**
     * @dev Update the base URI for token metadata
     * @param newBaseURI New base URI
     */
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    /**
     * @dev Base URI for computing tokenURI
     * @return Base URI string
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Override to prevent transfers (Soulbound)
     */
    function transferFrom(
        address,
        address,
        uint256
    ) public pure override {
        revert("AuthorshipToken: Tokens are soulbound and cannot be transferred");
    }

    /**
     * @dev Override to prevent transfers (Soulbound)
     */
    function safeTransferFrom(
        address,
        address,
        uint256,
        bytes memory
    ) public pure override {
        revert("AuthorshipToken: Tokens are soulbound and cannot be transferred");
    }

    /**
     * @dev Override to prevent approvals (Soulbound)
     */
    function approve(address, uint256) public pure override {
        revert("AuthorshipToken: Tokens are soulbound and cannot be approved");
    }

    /**
     * @dev Override to prevent operator approvals (Soulbound)
     */
    function setApprovalForAll(address, bool) public pure override {
        revert("AuthorshipToken: Tokens are soulbound and cannot have operators");
    }

    /**
     * @dev Check if a token exists
     * @param tokenId Token ID to check
     * @return True if token exists
     */
    function exists(uint256 tokenId) public view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Get comprehensive proof data for a token
     * @param tokenId Token ID
     * @return Proof metadata struct
     */
    function getProofData(uint256 tokenId) public view returns (ProofMetadata memory) {
        require(exists(tokenId), "AuthorshipToken: Token does not exist");
        return proofData[tokenId];
    }

    /**
     * @dev Override supportsInterface to indicate ERC721 compliance
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
