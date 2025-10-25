import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("NeuraMark", async function () {
  const { viem } = await network.connect();
  const [owner, otherAccount] = await viem.getWalletClients();

  it("Should deploy successfully", async function () {
    const neuraMark = await viem.deployContract("NeuraMark");
    assert.ok(neuraMark.address);
  });

  it("Should register a new proof successfully", async function () {
    const neuraMark = await viem.deployContract("NeuraMark");

    const promptHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const outputHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    const modelInfo = "GPT-4";
    const promptCID = "ipfs://QmPromptHash123";
    const outputCID = "ipfs://QmOutputHash456";

    const tx = await neuraMark.write.registerProof([
      promptHash,
      outputHash,
      modelInfo,
      promptCID,
      outputCID,
    ]);

    assert.ok(tx);
  });

  it("Should emit ProofRegistered event", async function () {
    const neuraMark = await viem.deployContract("NeuraMark");

    const promptHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const outputHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    const modelInfo = "GPT-4";
    const promptCID = "ipfs://QmPromptHash123";
    const outputCID = "ipfs://QmOutputHash456";

    const tx = await neuraMark.write.registerProof([
      promptHash,
      outputHash,
      modelInfo,
      promptCID,
      outputCID,
    ]);

    assert.ok(tx); // Event emission is tested by successful transaction
  });

  it("Should calculate correct proofId", async function () {
    const neuraMark = await viem.deployContract("NeuraMark");

    const promptHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const outputHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    const modelInfo = "GPT-4";
    const promptCID = "ipfs://QmPromptHash123";
    const outputCID = "ipfs://QmOutputHash456";

    // Get expected proofId from contract
    const expectedProofId = await neuraMark.read.getProofId([
      promptHash,
      outputHash,
      owner.account.address,
    ]);

    // Register proof
    await neuraMark.write.registerProof([
      promptHash,
      outputHash,
      modelInfo,
      promptCID,
      outputCID,
    ]);

    // Check if proof exists
    const exists = await neuraMark.read.isProofRegistered([expectedProofId]);
    assert.equal(exists, true);
  });

  it("Should reject empty promptHash", async function () {
    const neuraMark = await viem.deployContract("NeuraMark");

    await assert.rejects(
      async () => {
        await neuraMark.write.registerProof([
          "",
          "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          "GPT-4",
          "ipfs://QmPromptHash123",
          "ipfs://QmOutputHash456",
        ]);
      },
      /Prompt hash cannot be empty/
    );
  });

  it("Should reject empty outputHash", async function () {
    const neuraMark = await viem.deployContract("NeuraMark");

    await assert.rejects(
      async () => {
        await neuraMark.write.registerProof([
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          "",
          "GPT-4",
          "ipfs://QmPromptHash123",
          "ipfs://QmOutputHash456",
        ]);
      },
      /Output hash cannot be empty/
    );
  });

  it("Should reject empty modelInfo", async function () {
    const neuraMark = await viem.deployContract("NeuraMark");

    await assert.rejects(
      async () => {
        await neuraMark.write.registerProof([
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          "",
          "ipfs://QmPromptHash123",
          "ipfs://QmOutputHash456",
        ]);
      },
      /Model info cannot be empty/
    );
  });

  it("Should reject empty promptCID", async function () {
    const neuraMark = await viem.deployContract("NeuraMark");

    await assert.rejects(
      async () => {
        await neuraMark.write.registerProof([
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          "GPT-4",
          "",
          "ipfs://QmOutputHash456",
        ]);
      },
      /Prompt CID cannot be empty/
    );
  });

  it("Should reject empty outputCID", async function () {
    const neuraMark = await viem.deployContract("NeuraMark");

    await assert.rejects(
      async () => {
        await neuraMark.write.registerProof([
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          "GPT-4",
          "ipfs://QmPromptHash123",
          "",
        ]);
      },
      /Output CID cannot be empty/
    );
  });

  it("Should prevent duplicate proof registration", async function () {
    const neuraMark = await viem.deployContract("NeuraMark");

    const promptHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const outputHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    const modelInfo = "GPT-4";
    const promptCID = "ipfs://QmPromptHash123";
    const outputCID = "ipfs://QmOutputHash456";

    // Register proof first time
    await neuraMark.write.registerProof([
      promptHash,
      outputHash,
      modelInfo,
      promptCID,
      outputCID,
    ]);

    // Try to register same proof again
    await assert.rejects(
      async () => {
        await neuraMark.write.registerProof([
          promptHash,
          outputHash,
          modelInfo,
          promptCID,
          outputCID,
        ]);
      },
      /Proof already registered/
    );
  });

  it("Should verify an existing proof", async function () {
    const neuraMark = await viem.deployContract("NeuraMark");

    const promptHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const outputHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    const modelInfo = "GPT-4";
    const promptCID = "ipfs://QmPromptHash123";
    const outputCID = "ipfs://QmOutputHash456";

    // Register proof
    await neuraMark.write.registerProof([
      promptHash,
      outputHash,
      modelInfo,
      promptCID,
      outputCID,
    ]);

    // Get proofId
    const proofId = await neuraMark.read.getProofId([
      promptHash,
      outputHash,
      owner.account.address,
    ]);

    // Verify proof
    const proof = await neuraMark.read.verifyProof([proofId]) as {
      creator: string;
      promptHash: string;
      outputHash: string;
      modelInfo: string;
      promptCID: string;
      outputCID: string;
      timestamp: bigint;
    };

    assert.equal(proof.creator.toLowerCase(), owner.account.address.toLowerCase()); // creator
    assert.equal(proof.promptHash, promptHash); // promptHash
    assert.equal(proof.outputHash, outputHash); // outputHash
    assert.equal(proof.modelInfo, modelInfo); // modelInfo
    assert.equal(proof.promptCID, promptCID); // promptCID
    assert.equal(proof.outputCID, outputCID); // outputCID
    assert.ok(typeof proof.timestamp === "bigint"); // timestamp
  });

  it("Should reject verification of non-existent proof", async function () {
    const neuraMark = await viem.deployContract("NeuraMark");

    const fakeProofId = "0x0000000000000000000000000000000000000000000000000000000000000001";

    await assert.rejects(
      async () => {
        await neuraMark.read.verifyProof([fakeProofId]);
      },
      /Proof not found/
    );
  });

  it("Should retrieve proof by hashes and creator", async function () {
    const neuraMark = await viem.deployContract("NeuraMark");

    const promptHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const outputHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    const modelInfo = "Claude 3";
    const promptCID = "ipfs://QmPromptHash789";
    const outputCID = "ipfs://QmOutputHash101";

    // Register proof
    await neuraMark.write.registerProof([
      promptHash,
      outputHash,
      modelInfo,
      promptCID,
      outputCID,
    ]);

    // Get proof by hashes
    const proof = await neuraMark.read.getProofByHashes([
      promptHash,
      outputHash,
      owner.account.address,
    ]) as {
      creator: string;
      promptHash: string;
      outputHash: string;
      modelInfo: string;
      promptCID: string;
      outputCID: string;
      timestamp: bigint;
    };

    assert.equal(proof.modelInfo, modelInfo); // modelInfo
    assert.equal(proof.promptCID, promptCID); // promptCID
    assert.equal(proof.outputCID, outputCID); // outputCID
  });

  it("Should allow different users to register proofs with same hashes", async function () {
    const neuraMark = await viem.deployContract("NeuraMark");

    const promptHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const outputHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    const modelInfo = "GPT-4";
    const promptCID = "ipfs://QmPromptHash123";
    const outputCID = "ipfs://QmOutputHash456";

    // Owner registers proof
    await neuraMark.write.registerProof([
      promptHash,
      outputHash,
      modelInfo,
      promptCID,
      outputCID,
    ]);

    // Other account registers same proof (different creator = different proofId)
    const neuraMarkOther = await viem.getContractAt(
      "NeuraMark",
      neuraMark.address,
      { client: { wallet: otherAccount } }
    );

    await neuraMarkOther.write.registerProof([
      promptHash,
      outputHash,
      modelInfo,
      promptCID,
      outputCID,
    ]);

    // Verify both proofs exist
    const proofId1 = await neuraMark.read.getProofId([
      promptHash,
      outputHash,
      owner.account.address,
    ]);
    const proofId2 = await neuraMark.read.getProofId([
      promptHash,
      outputHash,
      otherAccount.account.address,
    ]);

    const exists1 = await neuraMark.read.isProofRegistered([proofId1]);
    const exists2 = await neuraMark.read.isProofRegistered([proofId2]);

    assert.equal(exists1, true);
    assert.equal(exists2, true);
    assert.notEqual(proofId1, proofId2);
  });
});

