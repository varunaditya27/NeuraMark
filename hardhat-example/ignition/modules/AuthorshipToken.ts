import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Hardhat Ignition Module for AuthorshipToken Deployment
 * 
 * Deploys the soulbound NFT contract for NeuraMark authorship proofs.
 * The base URI should point to your Next.js API metadata endpoint.
 */

const AuthorshipTokenModule = buildModule("AuthorshipTokenModule", (m) => {
  // Base URI for token metadata
  // Update this after deployment to point to your deployed Next.js API
  // Format: https://your-domain.com/api/metadata/
  const baseURI = m.getParameter("baseURI", "https://neuramark.com/api/metadata/");

  // Deploy AuthorshipToken contract
  const authorshipToken = m.contract("AuthorshipToken", [baseURI]);

  return { authorshipToken };
});

export default AuthorshipTokenModule;
