import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Hardhat Ignition Module for NeuraMark Contract Deployment
 */
const NeuraMarkModule = buildModule("NeuraMarkModule", (m) => {
  // Deploy the NeuraMark contract
  const neuraMark = m.contract("NeuraMark");

  return { neuraMark };
});

export default NeuraMarkModule;
