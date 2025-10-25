# Authorship NFT Certificates

For every proof registered on the NeuraMark platform, a soulbound (non-transferable) ERC-721 token is automatically minted. These NFTs serve as immutable, on-chain certificates of authorship.

## Soulbound Tokens for Proof of Ownership

Soulbound NFTs are a special type of non-fungible token that cannot be transferred from one wallet to another. This immutability makes them ideal for representing personal achievements, credentials, and, in the case of NeuraMark, authorship.

### Key Features

-   **Soulbound**: The tokens are non-transferable, ensuring that the proof of authorship remains with the original creator.
-   **ERC-721 Standard**: The NFTs are compliant with the ERC-721 standard, making them viewable on platforms like OpenSea and Etherscan (on the Sepolia testnet).
-   **On-Chain Metadata**: Each NFT contains on-chain metadata, including proof hashes, IPFS CIDs, and model information.
-   **Visual Certificates**: The NFTs link to rich metadata, providing a visual representation of the proof.

## Smart Contract

The AuthorshipToken contract is a standard ERC-721 contract with transferability disabled.

**Contract Address**: [`0x951df3400098cB80990B54E6bE651a54f94A36BF`](https://sepolia.etherscan.io/address/0x951df3400098cB80990B54E6bE651a54f94A36BF)
**Token Name**: NeuraMark Authorship Token
**Symbol**: NEURA
**Network**: Sepolia Testnet

```solidity
contract AuthorshipToken is ERC721, Ownable {
    struct ProofMetadata {
        string promptHash;
        string outputHash;
        string ipfsCID;
        string modelInfo;
        uint256 timestamp;
        address creator;
    }

    function mintAuthorshipToken(
        address to,
        string memory promptHash,
        string memory outputHash,
        string memory ipfsCID,
        string memory modelInfo
    ) external returns (uint256 tokenId);

    // Transfer functions are overridden to revert (soulbound)
}
```

## How It Works

1.  **Register Proof**: A user registers their AI-generated content.
2.  **Auto-Mint NFT**: The system automatically mints a soulbound NFT with the proof's metadata.
3.  **Store Token ID**: The token ID is linked to the proof in the NeuraMark database.
4.  **View Certificate**: The user can view their NFT certificate in their dashboard.

This system provides a powerful, on-chain representation of authorship that is both verifiable and permanent.