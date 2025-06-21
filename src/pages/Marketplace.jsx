import React, { useEffect, useState } from "react";
import { getContract } from "../utils/useContracts";
import { ethers } from "ethers";

const Marketplace = ({ signer }) => {
  const [ideas, setIdeas] = useState([]);
  const [unlocked, setUnlocked] = useState({});
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);

  useEffect(() => {
    if (!signer) return;

    const loadIdeas = async () => {
      try {
        setLoading(true);
        const contract = getContract(signer);
        const allIdeas = await contract.getAllIdeas();
        setIdeas(allIdeas);
      } catch (err) {
        console.error("Failed to load ideas:", err);
      } finally {
        setLoading(false);
      }
    };

    loadIdeas();
  }, [signer]);

  const buyIdea = async (id, price) => {
    try {
      setBuyingId(id);
      const contract = getContract(signer);
      const tx = await contract.buyIdea(id, { value: price });
      await tx.wait();
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'success-toast';
      successDiv.textContent = '🎉 Purchase successful! Idea unlocked!';
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
      
      unlockIdea(id);
    } catch (err) {
      console.error("Buy failed:", err);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-toast';
      errorDiv.textContent = `❌ Purchase failed: ${err.message}`;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
    } finally {
      setBuyingId(null);
    }
  };

  const unlockIdea = async (id) => {
    try {
      const contract = getContract(signer);
      const [desc, docUrl, extLink] = await contract.getIdeaDetails(id);
      setUnlocked((prev) => ({
        ...prev,
        [id]: { description: desc, docUrl, externalLink: extLink },
      }));
    } catch (err) {
      console.warn("Not authorized to unlock:", err);
    }
  };

  useEffect(() => {
    ideas.forEach((idea) => unlockIdea(idea.id));
  }, [ideas]);

  if (loading) {
    return (
      <div className="marketplace-container">
        <h2 className="marketplace-heading">🛒 Marketplace</h2>
        <div className="loading-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="idea-card loading">
              <div className="loading-content">
                <div className="loading-title"></div>
                <div className="loading-text"></div>
                <div className="loading-text"></div>
                <div className="loading-button"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-container">
      <h2 className="marketplace-heading">🛒 Marketplace</h2>
      <div className="marketplace-stats">
        <div className="stat-card">
          <span className="stat-number">{ideas.length}</span>
          <span className="stat-label">Ideas Available</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{Object.keys(unlocked).length}</span>
          <span className="stat-label">Ideas Unlocked</span>
        </div>
      </div>
      
      {ideas.length === 0 ? (
        <div className="no-ideas">
          <div className="no-ideas-icon">💡</div>
          <h3>No ideas available yet</h3>
          <p>Be the first to submit an innovative idea to the marketplace!</p>
        </div>
      ) : (
        <div className="idea-grid">
          {ideas.map((idea) => {
            const unlockedIdea = unlocked[idea.id];
            const priceEth = ethers.formatEther(idea.price);
            const isCurrentlyBuying = buyingId === idea.id;

            return (
              <div key={idea.id} className="idea-card">
                <div className="idea-header">
                  <h3 className="idea-title">{idea.title}</h3>
                  <div className="idea-meta">
                    <span className="idea-creator">
                      👤 {idea.creator.slice(0, 6)}...{idea.creator.slice(-4)}
                    </span>
                    <span className="idea-date">
                      📅 {new Date(Number(idea.timestamp) * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {unlockedIdea ? (
                  <div className="idea-details">
                    <div className="unlocked-badge">🔓 Unlocked</div>
                    <p className="idea-description">{unlockedIdea.description}</p>
                    <div className="idea-links">
                      {unlockedIdea.docUrl && (
                        <a href={unlockedIdea.docUrl} target="_blank" rel="noreferrer" className="idea-link">
                          📄 View Documentation
                        </a>
                      )}
                      {unlockedIdea.externalLink && (
                        <a href={unlockedIdea.externalLink} target="_blank" rel="noreferrer" className="idea-link">
                          🔗 External Link
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="locked-content">
                    <div className="locked-badge">🔒 Locked</div>
                    <p className="locked-description">
                      This idea is locked. Purchase to unlock full details, documentation, and external links.
                    </p>
                    <div className="price-section">
                      <span className="price">💰 {priceEth} ETH</span>
                      <button 
                        className={`buy-btn ${isCurrentlyBuying ? 'buying' : ''}`}
                        onClick={() => buyIdea(idea.id, idea.price)}
                        disabled={isCurrentlyBuying}
                      >
                        {isCurrentlyBuying ? (
                          <>🔄 Processing...</>
                        ) : (
                          <>🔓 Buy to Unlock</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Marketplace;