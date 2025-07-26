import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "../utils/useContracts";

const MiniApp = ({ mode = "view", ideaId = null, onSuccess }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idea, setIdea] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: ""
  });

  // Connect wallet function
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setIsConnecting(true);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setWalletAddress(accounts[0]);
        setSigner(signer);
        return { address: accounts[0], signer };
      } catch (error) {
        console.error("Connection failed:", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Load idea details if in view mode
  useEffect(() => {
    if (mode === "view" && ideaId && signer) {
      loadIdeaDetails();
    }
  }, [ideaId, signer, mode]);

  const loadIdeaDetails = async () => {
    try {
      const contract = getContract(signer);
      const allIdeas = await contract.getAllIdeas();
      const targetIdea = allIdeas.find(idea => idea.id.toString() === ideaId);
      if (targetIdea) {
        setIdea(targetIdea);
      }
    } catch (error) {
      console.error("Failed to load idea:", error);
    }
  };

  // Submit idea function
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signer) {
      alert("Please connect wallet first");
      return;
    }

    try {
      setLoading(true);
      const contract = getContract(signer);
      const tx = await contract.submitIdea(
        formData.title,
        formData.description,
        "", // docUrl - simplified for mini app
        "", // externalLink - simplified for mini app
        ethers.parseEther(formData.price)
      );
      await tx.wait();
      
      // Reset form
      setFormData({ title: "", description: "", price: "" });
      
      // Call success callback
      if (onSuccess) {
        onSuccess("Idea submitted successfully!");
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Submission failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Buy idea function
  const handleBuy = async () => {
    if (!signer || !idea) return;

    try {
      setLoading(true);
      const contract = getContract(signer);
      const tx = await contract.buyIdea(idea.id, { value: idea.price });
      await tx.wait();
      
      if (onSuccess) {
        onSuccess("Idea purchased successfully!");
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mini App Header
  const MiniHeader = () => (
    <div className="mini-header">
      <h3>💡 Idea Marketplace</h3>
      {!walletAddress ? (
        <button 
          onClick={connectWallet} 
          className="mini-connect-btn"
          disabled={isConnecting}
        >
          {isConnecting ? "🔄" : "🔗 Connect"}
        </button>
      ) : (
        <span className="mini-wallet">
          {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
        </span>
      )}
    </div>
  );

  // Submit Mode
  if (mode === "submit") {
    return (
      <div className="mini-app-container">
        <MiniHeader />
        
        <form onSubmit={handleSubmit} className="mini-form">
          <div className="mini-form-group">
            <input
              type="text"
              placeholder="Idea Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              className="mini-input"
            />
          </div>
          
          <div className="mini-form-group">
            <textarea
              placeholder="Describe your idea..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              rows="3"
              className="mini-textarea"
            />
          </div>
          
          <div className="mini-form-group">
            <input
              type="number"
              placeholder="Price in ETH"
              step="0.001"
              min="0.001"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
              className="mini-input"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !walletAddress}
            className="mini-submit-btn"
          >
            {loading ? "🔄 Submitting..." : "🚀 Submit Idea"}
          </button>
        </form>
      </div>
    );
  }

  // View Mode
  if (mode === "view" && idea) {
    return (
      <div className="mini-app-container">
        <MiniHeader />
        
        <div className="mini-idea-card">
          <h4 className="mini-idea-title">{idea.title}</h4>
          <p className="mini-idea-description">{idea.description}</p>
          <div className="mini-idea-meta">
            <span className="mini-price">
              💰 {ethers.formatEther(idea.price)} ETH
            </span>
            <span className="mini-creator">
              👤 {idea.creator.slice(0, 6)}...{idea.creator.slice(-4)}
            </span>
          </div>
          
          <button 
            onClick={handleBuy}
            disabled={loading || !walletAddress}
            className="mini-buy-btn"
          >
            {loading ? "🔄 Processing..." : "🔓 Buy Idea"}
          </button>
        </div>
      </div>
    );
  }

  // Default view (no idea selected)
  return (
    <div className="mini-app-container">
      <MiniHeader />
      <div className="mini-placeholder">
        <p>Select an idea to view details</p>
      </div>
    </div>
  );
};

export default MiniApp; 