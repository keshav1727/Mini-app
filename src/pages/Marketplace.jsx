import React, { useEffect, useState } from "react";
import { getContract } from "../utils/useContracts";
import { ethers } from "ethers";

const Marketplace = ({ signer }) => {
  const [ideas, setIdeas] = useState([]);
  const [unlocked, setUnlocked] = useState({});

  useEffect(() => {
    if (!signer) return;

    const loadIdeas = async () => {
      try {
        const contract = getContract(signer);
        const allIdeas = await contract.getAllIdeas();
        setIdeas(allIdeas);
      } catch (err) {
        console.error("Failed to load ideas:", err);
      }
    };

    loadIdeas();
  }, [signer]);

  const buyIdea = async (id, price) => {
    try {
      const contract = getContract(signer);
      const tx = await contract.buyIdea(id, { value: price });
      await tx.wait();
      alert("Purchase successful!");
      unlockIdea(id);
    } catch (err) {
      alert("Buy failed: " + err.message);
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

  return (
    <div className="marketplace-container">
      <h2 className="marketplace-heading">🛒 Marketplace</h2>
      {ideas.length === 0 ? (
        <p className="no-ideas">No ideas yet.</p>
      ) : (
        <div className="idea-grid">
          {ideas.map((idea) => {
            const unlockedIdea = unlocked[idea.id];
            const priceEth = ethers.formatEther(idea.price);

            return (
              <div key={idea.id} className="idea-card">
                <h3 className="idea-title">{idea.title}</h3>

                {unlockedIdea ? (
                  <div className="idea-details">
                    <p>{unlockedIdea.description}</p>
                    <a href={unlockedIdea.docUrl} target="_blank" rel="noreferrer">📄 View Docs</a><br />
                    <a href={unlockedIdea.externalLink} target="_blank" rel="noreferrer">🔗 External Link</a>
                  </div>
                ) : (
                  <>
                    <p className="price"><strong>Price:</strong> {priceEth} ETH</p>
                    <button className="buy-btn" onClick={() => buyIdea(idea.id, idea.price)}>
                      🔓 Buy to Unlock
                    </button>
                  </>
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
