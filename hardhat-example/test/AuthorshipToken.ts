import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("AuthorshipToken", async function () {
  const { viem } = await network.connect();
  const [owner, addr1, addr2] = await viem.getWalletClients();

  const baseURI = "https://api.neuramark.com/metadata/";
  const sampleProof = {
    promptHash: "0x" + "a".repeat(64),
    outputHash: "0x" + "b".repeat(64),
    ipfsCID: "QmXyz123AbC456DeF789",
    modelInfo: "GPT-4",
  };

  // ========== Deployment Tests ==========
  it("Should deploy with correct name and symbol", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);
    const name = await contract.read.name();
    const symbol = await contract.read.symbol();
    
    assert.equal(name, "NeuraMark Authorship Token");
    assert.equal(symbol, "NEURA");
  });

  it("Should set the correct owner", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);
    const contractOwner = await contract.read.owner();
    assert.equal(contractOwner.toLowerCase(), owner.account.address.toLowerCase());
  });

  it("Should initialize with zero total supply", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);
    const totalSupply = await contract.read.totalSupply();
    assert.equal(Number(totalSupply), 0);
  });

  // ========== Minting Tests ==========
  it("Should mint a new authorship token successfully", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);

    const tx = await contract.write.mintAuthorshipToken([
      addr1.account.address,
      sampleProof.promptHash,
      sampleProof.outputHash,
      sampleProof.ipfsCID,
      sampleProof.modelInfo,
    ]);

    assert.ok(tx);

    const totalSupply = await contract.read.totalSupply();
    assert.equal(Number(totalSupply), 1);

    const tokenOwner = await contract.read.ownerOf([1n]);
    assert.equal(tokenOwner.toLowerCase(), addr1.account.address.toLowerCase());
  });

  it("Should store proof metadata correctly", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);

    await contract.write.mintAuthorshipToken([
      addr1.account.address,
      sampleProof.promptHash,
      sampleProof.outputHash,
      sampleProof.ipfsCID,
      sampleProof.modelInfo,
    ]);

    const proofData = await contract.read.getProofData([1n]);
    
    assert.equal(proofData[0], sampleProof.promptHash);
    assert.equal(proofData[1], sampleProof.outputHash);
    assert.equal(proofData[2], sampleProof.ipfsCID);
    assert.equal(proofData[3], sampleProof.modelInfo);
    assert.equal(proofData[5].toLowerCase(), addr1.account.address.toLowerCase());
  });

  it("Should emit AuthorshipMinted event", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);

    const tx = await contract.write.mintAuthorshipToken([
      addr1.account.address,
      sampleProof.promptHash,
      sampleProof.outputHash,
      sampleProof.ipfsCID,
      sampleProof.modelInfo,
    ]);

    assert.ok(tx);
  });

  it("Should track creator tokens correctly", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);

    await contract.write.mintAuthorshipToken([
      addr1.account.address,
      sampleProof.promptHash,
      sampleProof.outputHash,
      sampleProof.ipfsCID,
      sampleProof.modelInfo,
    ]);

    await contract.write.mintAuthorshipToken([
      addr1.account.address,
      "0x" + "c".repeat(64),
      "0x" + "d".repeat(64),
      "QmAnotherCID",
      "Claude-3",
    ]);

    const tokens = await contract.read.getTokensByCreator([addr1.account.address]);
    assert.equal(tokens.length, 2);
    assert.equal(Number(tokens[0]), 1);
    assert.equal(Number(tokens[1]), 2);
  });

  // ========== Soulbound Tests (No Transfers) ==========
  it("Should prevent transferFrom", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);

    await contract.write.mintAuthorshipToken([
      addr1.account.address,
      sampleProof.promptHash,
      sampleProof.outputHash,
      sampleProof.ipfsCID,
      sampleProof.modelInfo,
    ]);

    const addr1Contract = await viem.getContractAt(
      "AuthorshipToken",
      contract.address,
      { client: { wallet: addr1 } }
    );

    await assert.rejects(
      async () => {
        await addr1Contract.write.transferFrom([
          addr1.account.address,
          addr2.account.address,
          1n,
        ]);
      },
      (error: Error) => {
        return error.message.includes("SoulboundToken");
      }
    );
  });

  it("Should prevent safeTransferFrom", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);

    await contract.write.mintAuthorshipToken([
      addr1.account.address,
      sampleProof.promptHash,
      sampleProof.outputHash,
      sampleProof.ipfsCID,
      sampleProof.modelInfo,
    ]);

    const addr1Contract = await viem.getContractAt(
      "AuthorshipToken",
      contract.address,
      { client: { wallet: addr1 } }
    );

    await assert.rejects(
      async () => {
        await addr1Contract.write["safeTransferFrom(address,address,uint256)"]([
          addr1.account.address,
          addr2.account.address,
          1n,
        ]);
      },
      (error: Error) => {
        return error.message.includes("SoulboundToken");
      }
    );
  });

  it("Should prevent approve", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);

    await contract.write.mintAuthorshipToken([
      addr1.account.address,
      sampleProof.promptHash,
      sampleProof.outputHash,
      sampleProof.ipfsCID,
      sampleProof.modelInfo,
    ]);

    const addr1Contract = await viem.getContractAt(
      "AuthorshipToken",
      contract.address,
      { client: { wallet: addr1 } }
    );

    await assert.rejects(
      async () => {
        await addr1Contract.write.approve([addr2.account.address, 1n]);
      },
      (error: Error) => {
        return error.message.includes("SoulboundToken");
      }
    );
  });

  it("Should prevent setApprovalForAll", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);

    await contract.write.mintAuthorshipToken([
      addr1.account.address,
      sampleProof.promptHash,
      sampleProof.outputHash,
      sampleProof.ipfsCID,
      sampleProof.modelInfo,
    ]);

    const addr1Contract = await viem.getContractAt(
      "AuthorshipToken",
      contract.address,
      { client: { wallet: addr1 } }
    );

    await assert.rejects(
      async () => {
        await addr1Contract.write.setApprovalForAll([addr2.account.address, true]);
      },
      (error: Error) => {
        return error.message.includes("SoulboundToken");
      }
    );
  });

  // ========== Validation Tests ==========
  it("Should reject minting to zero address", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);

    await assert.rejects(
      async () => {
        await contract.write.mintAuthorshipToken([
          "0x0000000000000000000000000000000000000000",
          sampleProof.promptHash,
          sampleProof.outputHash,
          sampleProof.ipfsCID,
          sampleProof.modelInfo,
        ]);
      },
      (error: Error) => {
        return error.message.includes("Invalid recipient");
      }
    );
  });

  it("Should reject empty prompt hash", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);

    await assert.rejects(
      async () => {
        await contract.write.mintAuthorshipToken([
          addr1.account.address,
          "",
          sampleProof.outputHash,
          sampleProof.ipfsCID,
          sampleProof.modelInfo,
        ]);
      },
      (error: Error) => {
        return error.message.includes("Prompt hash required");
      }
    );
  });

  it("Should reject empty output hash", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);

    await assert.rejects(
      async () => {
        await contract.write.mintAuthorshipToken([
          addr1.account.address,
          sampleProof.promptHash,
          "",
          sampleProof.ipfsCID,
          sampleProof.modelInfo,
        ]);
      },
      (error: Error) => {
        return error.message.includes("Output hash required");
      }
    );
  });

  it("Should reject empty IPFS CID", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);

    await assert.rejects(
      async () => {
        await contract.write.mintAuthorshipToken([
          addr1.account.address,
          sampleProof.promptHash,
          sampleProof.outputHash,
          "",
          sampleProof.modelInfo,
        ]);
      },
      (error: Error) => {
        return error.message.includes("IPFS CID required");
      }
    );
  });

  it("Should reject empty model info", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);

    await assert.rejects(
      async () => {
        await contract.write.mintAuthorshipToken([
          addr1.account.address,
          sampleProof.promptHash,
          sampleProof.outputHash,
          sampleProof.ipfsCID,
          "",
        ]);
      },
      (error: Error) => {
        return error.message.includes("Model info required");
      }
    );
  });

  // ========== Utility Function Tests ==========
  it("Should check if token exists", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);

    const existsBefore = await contract.read.exists([1n]);
    assert.equal(existsBefore, false);

    await contract.write.mintAuthorshipToken([
      addr1.account.address,
      sampleProof.promptHash,
      sampleProof.outputHash,
      sampleProof.ipfsCID,
      sampleProof.modelInfo,
    ]);

    const existsAfter = await contract.read.exists([1n]);
    assert.equal(existsAfter, true);
  });

  it("Should update base URI (owner only)", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);

    const newBaseURI = "https://new-api.neuramark.com/metadata/";
    await contract.write.setBaseURI([newBaseURI]);

    await contract.write.mintAuthorshipToken([
      addr1.account.address,
      sampleProof.promptHash,
      sampleProof.outputHash,
      sampleProof.ipfsCID,
      sampleProof.modelInfo,
    ]);

    const tokenURI = await contract.read.tokenURI([1n]);
    assert.ok(tokenURI.includes(newBaseURI));
  });

  it("Should support ERC721 interface", async function () {
    const contract = await viem.deployContract("AuthorshipToken", [baseURI]);

    const ERC721_INTERFACE_ID = "0x80ac58cd";
    const supportsInterface = await contract.read.supportsInterface([ERC721_INTERFACE_ID]);
    
    assert.equal(supportsInterface, true);
  });
});
