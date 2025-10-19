// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NeuraMark
 * @dev Proof-of-Prompt Authorship Verification System
 * @notice This contract enables users to register and verify AI-generated content authorship
 */
contract NeuraMark {
    struct Proof {
        address creator;
        string promptHash;
        string outputHash;
        string modelInfo;
        string promptCID;
        string outputCID;
        uint256 timestamp;
    }

    // Mapping from proofId to Proof
    mapping(bytes32 => Proof) public proofs;
    
    // Track registered proof IDs to prevent duplicates
    mapping(bytes32 => bool) public proofExists;

    event ProofRegistered(
        address indexed creator,
        bytes32 indexed proofId,
        string promptHash,
        string outputHash,
        string modelInfo,
        string promptCID,
        string outputCID,
        uint256 timestamp
    );

    /**
     * @dev Register a new proof on the blockchain
     * @param promptHash SHA-256 hash of the prompt
     * @param outputHash SHA-256 hash of the AI-generated output
     * @param modelInfo Information about the AI model used
     * @param promptCID IPFS CID for the prompt content
     * @param outputCID IPFS CID for the output content
     */
    function registerProof(
        string memory promptHash,
        string memory outputHash,
        string memory modelInfo,
        string memory promptCID,
        string memory outputCID
    ) public returns (bytes32) {
        // Validation checks
        require(bytes(promptHash).length > 0, "Prompt hash cannot be empty");
        require(bytes(outputHash).length > 0, "Output hash cannot be empty");
        require(bytes(modelInfo).length > 0, "Model info cannot be empty");
        require(bytes(promptCID).length > 0, "Prompt CID cannot be empty");
        require(bytes(outputCID).length > 0, "Output CID cannot be empty");

        // Generate unique proof ID
        bytes32 proofId = getProofId(promptHash, outputHash, msg.sender);

        // Check for duplicate registration
        require(!proofExists[proofId], "Proof already registered");

        // Create and store proof
        proofs[proofId] = Proof({
            creator: msg.sender,
            promptHash: promptHash,
            outputHash: outputHash,
            modelInfo: modelInfo,
            promptCID: promptCID,
            outputCID: outputCID,
            timestamp: block.timestamp
        });

        // Mark proof as registered
        proofExists[proofId] = true;

        // Emit event
        emit ProofRegistered(
            msg.sender,
            proofId,
            promptHash,
            outputHash,
            modelInfo,
            promptCID,
            outputCID,
            block.timestamp
        );

        return proofId;
    }

    /**
     * @dev Verify a proof by its ID
     * @param proofId The unique identifier of the proof
     * @return The Proof struct containing all proof details
     */
    function verifyProof(bytes32 proofId) public view returns (Proof memory) {
        require(proofExists[proofId], "Proof not found");
        return proofs[proofId];
    }

    /**
     * @dev Generate a unique proof ID
     * @param promptHash SHA-256 hash of the prompt
     * @param outputHash SHA-256 hash of the output
     * @param creator Address of the proof creator
     * @return Unique bytes32 identifier for the proof
     */
    function getProofId(
        string memory promptHash,
        string memory outputHash,
        address creator
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(promptHash, outputHash, creator));
    }

    /**
     * @dev Check if a proof exists
     * @param proofId The unique identifier of the proof
     * @return Boolean indicating if the proof exists
     */
    function isProofRegistered(bytes32 proofId) public view returns (bool) {
        return proofExists[proofId];
    }

    /**
     * @dev Get proof details by providing hashes and creator address
     * @param promptHash SHA-256 hash of the prompt
     * @param outputHash SHA-256 hash of the output
     * @param creator Address of the proof creator
     * @return The Proof struct if it exists
     */
    function getProofByHashes(
        string memory promptHash,
        string memory outputHash,
        address creator
    ) public view returns (Proof memory) {
        bytes32 proofId = getProofId(promptHash, outputHash, creator);
        return verifyProof(proofId);
    }
}
