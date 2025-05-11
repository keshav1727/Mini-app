import { ethers } from "ethers";
import IdeaMarket from "./abi/IdeaMarket.json";

const abi = IdeaMarket.abi;
const contractAddress = "0x5Ed9373601bBB51F8A678133B1a1E95564f202a0"; // ✅ your deployed Sepolia address

export function getContract(signerOrProvider) {
  if (!signerOrProvider) throw new Error("No signer provided");
  return new ethers.Contract(contractAddress, abi, signerOrProvider);
}
