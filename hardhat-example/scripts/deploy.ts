import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Deploy NeuraMark contract to Sepolia and update .env file
 */
async function main() {
  console.log("🚀 Starting NeuraMark contract deployment to Sepolia...\n");

  try {
    // Deploy using Hardhat Ignition
    const { stdout, stderr } = await execAsync(
      "npx hardhat ignition deploy ignition/modules/NeuraMark.ts --network sepolia"
    );

    console.log(stdout);
    if (stderr) console.error(stderr);

    // Parse the output to extract the contract address
    const addressMatch = stdout.match(/NeuraMarkModule#NeuraMark - (0x[a-fA-F0-9]{40})/);
    
    if (!addressMatch || !addressMatch[1]) {
      throw new Error("Failed to extract contract address from deployment output");
    }

    const contractAddress = addressMatch[1];
    console.log(`\n✅ NeuraMark deployed successfully at: ${contractAddress}\n`);

    // Update .env file
    const envPath = path.join(__dirname, "..", ".env");
    let envContent = "";

    // Read existing .env file if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }

    // Check if NEXT_PUBLIC_CONTRACT_ADDRESS already exists
    if (envContent.includes("NEXT_PUBLIC_CONTRACT_ADDRESS=")) {
      // Replace existing value
      envContent = envContent.replace(
        /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      // Append new value
      envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}\n`;
    }

    // Write back to .env
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Updated .env file with contract address\n`);

    console.log("📋 Deployment Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Network: Sepolia Testnet`);
    console.log(`Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("Next steps:");
    console.log("1. Verify your contract on Etherscan (optional)");
    console.log("2. Run tests: npx hardhat test");
    console.log("3. Integrate the contract address in your frontend\n");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
