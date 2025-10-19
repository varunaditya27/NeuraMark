import axios from "axios";

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;
const PINATA_JWT = process.env.PINATA_JWT;

/**
 * Upload content to IPFS via Pinata
 * @param fileContent - The content to upload (string or Buffer)
 * @param fileName - The name for the file
 * @returns IPFS URI (ipfs://CID)
 */
export const uploadToIPFS = async (
  fileContent: string | Buffer,
  fileName: string
): Promise<string> => {
  try {
    if (!PINATA_API_KEY && !PINATA_JWT) {
      throw new Error("Pinata API credentials not found in environment variables");
    }

    const data = new FormData();
    const blob = new Blob([fileContent], { type: "text/plain" });
    data.append("file", blob, fileName);

    // Optional: Add metadata
    const metadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        project: "NeuraMark",
        type: "proof-content",
      },
    });
    data.append("pinataMetadata", metadata);

    // Optional: Add pinning options
    const options = JSON.stringify({
      cidVersion: 1,
    });
    data.append("pinataOptions", options);

    // Use JWT if available, otherwise use API key
    const headers: Record<string, string> = {
      "Content-Type": "multipart/form-data",
    };

    if (PINATA_JWT) {
      headers["Authorization"] = `Bearer ${PINATA_JWT}`;
    } else if (PINATA_API_KEY && PINATA_SECRET_API_KEY) {
      headers["pinata_api_key"] = PINATA_API_KEY;
      headers["pinata_secret_api_key"] = PINATA_SECRET_API_KEY;
    }

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data,
      { headers }
    );

    const ipfsHash = response.data.IpfsHash;
    console.log(`✅ File uploaded to IPFS: ${ipfsHash}`);

    return `ipfs://${ipfsHash}`;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorData = error && typeof error === 'object' && 'response' in error 
      ? (error as { response?: { data?: unknown } }).response?.data 
      : undefined;
    console.error("❌ Error uploading to IPFS:", errorData || errorMessage);
    throw new Error(`Failed to upload to IPFS: ${errorMessage}`);
  }
};

/**
 * Upload JSON data to IPFS via Pinata
 * @param jsonData - The JSON object to upload
 * @param name - The name for the JSON file
 * @returns IPFS URI (ipfs://CID)
 */
export const uploadJSONToIPFS = async (
  jsonData: object,
  name: string
): Promise<string> => {
  try {
    if (!PINATA_API_KEY && !PINATA_JWT) {
      throw new Error("Pinata API credentials not found in environment variables");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (PINATA_JWT) {
      headers["Authorization"] = `Bearer ${PINATA_JWT}`;
    } else if (PINATA_API_KEY && PINATA_SECRET_API_KEY) {
      headers["pinata_api_key"] = PINATA_API_KEY;
      headers["pinata_secret_api_key"] = PINATA_SECRET_API_KEY;
    }

    const data = {
      pinataContent: jsonData,
      pinataMetadata: {
        name: name,
        keyvalues: {
          project: "NeuraMark",
          type: "proof-json",
        },
      },
      pinataOptions: {
        cidVersion: 1,
      },
    };

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data,
      { headers }
    );

    const ipfsHash = response.data.IpfsHash;
    console.log(`✅ JSON uploaded to IPFS: ${ipfsHash}`);

    return `ipfs://${ipfsHash}`;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorData = error && typeof error === 'object' && 'response' in error 
      ? (error as { response?: { data?: unknown } }).response?.data 
      : undefined;
    console.error("❌ Error uploading JSON to IPFS:", errorData || errorMessage);
    throw new Error(`Failed to upload JSON to IPFS: ${errorMessage}`);
  }
};

/**
 * Retrieve content from IPFS via Pinata Gateway
 * @param cid - The IPFS CID or full ipfs:// URI
 * @returns The content as string
 */
export const retrieveFromIPFS = async (cid: string): Promise<string> => {
  try {
    // Remove ipfs:// prefix if present
    const hash = cid.replace("ipfs://", "");
    
    // Use Pinata's dedicated gateway or public gateway
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;

    const response = await axios.get(gatewayUrl);
    return typeof response.data === "string"
      ? response.data
      : JSON.stringify(response.data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error retrieving from IPFS:", errorMessage);
    throw new Error(`Failed to retrieve from IPFS: ${errorMessage}`);
  }
};

/**
 * Test Pinata connection
 * @returns Boolean indicating if connection is successful
 */
export const testPinataConnection = async (): Promise<boolean> => {
  try {
    const headers: Record<string, string> = {};

    if (PINATA_JWT) {
      headers["Authorization"] = `Bearer ${PINATA_JWT}`;
    } else if (PINATA_API_KEY && PINATA_SECRET_API_KEY) {
      headers["pinata_api_key"] = PINATA_API_KEY;
      headers["pinata_secret_api_key"] = PINATA_SECRET_API_KEY;
    } else {
      throw new Error("No Pinata credentials found");
    }

    const response = await axios.get(
      "https://api.pinata.cloud/data/testAuthentication",
      { headers }
    );

    console.log("✅ Pinata connection successful:", response.data.message);
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorData = error && typeof error === 'object' && 'response' in error 
      ? (error as { response?: { data?: unknown } }).response?.data 
      : undefined;
    console.error("❌ Pinata connection failed:", errorData || errorMessage);
    return false;
  }
};
