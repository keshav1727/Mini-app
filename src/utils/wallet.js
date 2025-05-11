// utils/wallet.js
import { ethers } from "ethers";

export const connectWallet = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    return { address: accounts[0], signer };
  } catch (err) {
    console.error("MetaMask connection error:", err);
    return null;
  }
};
