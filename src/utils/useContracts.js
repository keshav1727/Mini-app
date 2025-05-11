import { ethers } from "ethers";
import IdeaMarket from "./abi/IdeaMarket.json";

const abi = IdeaMarket.abi;
const contractAddress = "0x115c743741280543F008a14F0B8feA075C126fB6"; // ✅ your deployed Sepolia address

export function getContract(signerOrProvider) {
  if (!signerOrProvider) throw new Error("No signer provided");
  return new ethers.Contract(contractAddress, abi, signerOrProvider);
}
