import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "../utils/useContracts";
import { telegramApp } from "../telegram-integration";
import "./MiniApp.css";

const TelegramMiniApp = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [currentView, setCurrentView] = useState("home"); // home, submit, browse, my-ideas
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: ""
  });
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Get Telegram user info
    const tgUser = telegramApp.getUserInfo();
    if (tgUser) {
      setUserInfo(tgUser);
      console.log("Telegram user:", tgUser);
    }

    // Set up Telegram UI
    setupTelegramUI();
  }, []);

  const setupTelegramUI = () => {
    // Set header color
    telegramApp.tg?.setHeaderColor('#0ea5e9');
    
    // Set background color based on theme
    const theme = telegramApp.getTheme();
    const bgColor = theme === 'dark' ? '#0f172a' : '#ffffff';
    telegramApp.tg?.setBackgroundColor(bgColor);
  };

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setLoading(true);
        telegramApp.hapticFeedback('light');
        
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setWalletAddress(accounts[0]);
        setSigner(signer);
        
        telegramApp.showAlert("Wallet connected successfully!");
        return { address: accounts[0], signer };
      } catch (error) {
        console.error("Connection failed:", error);
        telegramApp.showAlert("Wallet connection failed: " + error.message);
      } finally {
        setLoading(false);
      }
    } else {
      telegramApp.showAlert("Please install MetaMask!");
    }
  };

  // Load ideas
  const loadIdeas = async () => {
    if (!signer) return;
    
    try {
      setLoading(true);
      const contract = getContract(signer);
      const allIdeas = await contract.getAllIdeas();
      setIdeas(allIdeas);
    } catch (error) {
      console.error("Failed to load ideas:", error);
      telegramApp.showAlert("Failed to load ideas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit idea
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signer) {
      telegramApp.showAlert("Please connect wallet first");
      return;
    }

    try {
      setLoading(true);
      telegramApp.hapticFeedback('medium');
      
      const contract = getContract(signer);
      const tx = await contract.submitIdea(
        formData.title,
        formData.description,
        "", // docUrl
        "", // externalLink
        ethers.parseEther(formData.price)
      );
      await tx.wait();
      
      // Reset form
      setFormData({ title: "", description: "", price: "" });
      
      telegramApp.showAlert("Idea submitted successfully!");
      setCurrentView("home");
      
      // Share success message
      const shareText = `🚀 I just submitted a new startup idea on Idea Marketplace!\n\n"${formData.title}"\n\nCheck it out: @your_bot_username`;
      telegramApp.shareMessage(shareText);
      
    } catch (error) {
      console.error("Submission failed:", error);
      telegramApp.showAlert("Submission failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Buy idea
  const handleBuy = async (idea) => {
    if (!signer) {
      telegramApp.showAlert("Please connect wallet first");
      return;
    }

    telegramApp.showConfirm(
      `Buy "${idea.title}" for ${ethers.formatEther(idea.price)} ETH?`,
      async (confirmed) => {
        if (confirmed) {
          try {
            setLoading(true);
            telegramApp.hapticFeedback('heavy');
            
            const contract = getContract(signer);
            const tx = await contract.buyIdea(idea.id, { value: idea.price });
            await tx.wait();
            
            telegramApp.showAlert("Idea purchased successfully!");
            
            // Share purchase
            const shareText = `💡 I just bought an innovative startup idea!\n\n"${idea.title}"\n\nDiscover more ideas: @your_bot_username`;
            telegramApp.shareMessage(shareText);
            
          } catch (error) {
            console.error("Purchase failed:", error);
            telegramApp.showAlert("Purchase failed: " + error.message);
          } finally {
            setLoading(false);
          }
        }
      }
    );
  };

  // Navigation
  const navigateTo = (view) => {
    setCurrentView(view);
    telegramApp.hapticFeedback('light');
    
    if (view === 'browse' && ideas.length === 0) {
      loadIdeas();
    }
  };

  // Render Home View
  const renderHome = () => (
    <div className="telegram-home">
      <div className="welcome-section">
        <h2>💡 Idea Marketplace</h2>
        {userInfo && (
          <p>Welcome, {userInfo.firstName}! 👋</p>
        )}
        <p>Buy and sell innovative startup ideas on the blockchain</p>
      </div>
      
      <div className="action-buttons">
        <button 
          className="tg-btn primary"
          onClick={() => navigateTo('submit')}
        >
          📤 Submit Idea
        </button>
        
        <button 
          className="tg-btn secondary"
          onClick={() => navigateTo('browse')}
        >
          🛒 Browse Ideas
        </button>
        
        <button 
          className="tg-btn secondary"
          onClick={() => navigateTo('my-ideas')}
        >
          📁 My Ideas
        </button>
      </div>
      
      {!walletAddress && (
        <div className="wallet-section">
          <p>Connect your wallet to get started</p>
          <button 
            className="tg-btn connect"
            onClick={connectWallet}
            disabled={loading}
          >
            {loading ? "🔄 Connecting..." : "🔗 Connect Wallet"}
          </button>
        </div>
      )}
    </div>
  );

  // Render Submit View
  const renderSubmit = () => (
    <div className="telegram-submit">
      <h3>📤 Submit New Idea</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Idea Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
            className="tg-input"
          />
        </div>
        
        <div className="form-group">
          <textarea
            placeholder="Describe your idea..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
            rows="4"
            className="tg-textarea"
          />
        </div>
        
        <div className="form-group">
          <input
            type="number"
            placeholder="Price in ETH"
            step="0.001"
            min="0.001"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
            className="tg-input"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !walletAddress}
          className="tg-btn primary"
        >
          {loading ? "🔄 Submitting..." : "🚀 Submit Idea"}
        </button>
      </form>
      
      <button 
        className="tg-btn back"
        onClick={() => navigateTo('home')}
      >
        ← Back
      </button>
    </div>
  );

  // Render Browse View
  const renderBrowse = () => (
    <div className="telegram-browse">
      <h3>🛒 Browse Ideas</h3>
      
      {loading ? (
        <div className="loading">Loading ideas...</div>
      ) : ideas.length === 0 ? (
        <div className="no-ideas">
          <p>No ideas available yet</p>
          <button 
            className="tg-btn primary"
            onClick={() => navigateTo('submit')}
          >
            Submit First Idea
          </button>
        </div>
      ) : (
        <div className="ideas-list">
          {ideas.map((idea) => (
            <div key={idea.id} className="idea-item">
              <h4>{idea.title}</h4>
              <p>{idea.description}</p>
              <div className="idea-meta">
                <span className="price">💰 {ethers.formatEther(idea.price)} ETH</span>
                <span className="creator">👤 {idea.creator.slice(0, 6)}...</span>
              </div>
              <button 
                className="tg-btn buy"
                onClick={() => handleBuy(idea)}
                disabled={loading}
              >
                🔓 Buy Idea
              </button>
            </div>
          ))}
        </div>
      )}
      
      <button 
        className="tg-btn back"
        onClick={() => navigateTo('home')}
      >
        ← Back
      </button>
    </div>
  );

  // Render My Ideas View
  const renderMyIdeas = () => {
    const myIdeas = ideas.filter(idea => 
      idea.creator.toLowerCase() === walletAddress.toLowerCase()
    );
    
    return (
      <div className="telegram-my-ideas">
        <h3>📁 My Ideas</h3>
        
        {myIdeas.length === 0 ? (
          <div className="no-ideas">
            <p>You haven't submitted any ideas yet</p>
            <button 
              className="tg-btn primary"
              onClick={() => navigateTo('submit')}
            >
              Submit Your First Idea
            </button>
          </div>
        ) : (
          <div className="ideas-list">
            {myIdeas.map((idea) => (
              <div key={idea.id} className="idea-item">
                <h4>{idea.title}</h4>
                <p>{idea.description}</p>
                <div className="idea-meta">
                  <span className="price">💰 {ethers.formatEther(idea.price)} ETH</span>
                  <span className="id">ID: {idea.id.toString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button 
          className="tg-btn back"
          onClick={() => navigateTo('home')}
        >
          ← Back
        </button>
      </div>
    );
  };

  // Main render
  return (
    <div className="telegram-mini-app">
      {currentView === 'home' && renderHome()}
      {currentView === 'submit' && renderSubmit()}
      {currentView === 'browse' && renderBrowse()}
      {currentView === 'my-ideas' && renderMyIdeas()}
    </div>
  );
};

export default TelegramMiniApp; 